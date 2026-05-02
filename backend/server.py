import base64
import io
import logging
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from starlette.middleware.cors import CORSMiddleware

from emergentintegrations.llm.openai import (
    OpenAISpeechToText,
    OpenAITextToSpeech,
)

# ------------------------------------------------------------------------------
# Setup
# ------------------------------------------------------------------------------

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("echo")

# Mongo
mongo_url = os.environ["MONGO_URL"]
mongo_client = AsyncIOMotorClient(mongo_url)
db = mongo_client[os.environ["DB_NAME"]]

# LLM key
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")

# TTS & STT clients (emergentintegrations)
tts_client = OpenAITextToSpeech(api_key=EMERGENT_LLM_KEY)
stt_client = OpenAISpeechToText(api_key=EMERGENT_LLM_KEY)

app = FastAPI(title="ECHO Backend")
api_router = APIRouter(prefix="/api")

# ------------------------------------------------------------------------------
# Curated voice catalog (OpenAI TTS voices)
# ------------------------------------------------------------------------------

VOICES = [
    {"id": "alloy", "name": "Alloy", "tag": "neutral · balanced"},
    {"id": "ash", "name": "Ash", "tag": "clear · articulate"},
    {"id": "coral", "name": "Coral", "tag": "warm · friendly"},
    {"id": "echo", "name": "Echo", "tag": "smooth · calm"},
    {"id": "fable", "name": "Fable", "tag": "expressive · storyteller"},
    {"id": "nova", "name": "Nova", "tag": "energetic · upbeat"},
    {"id": "onyx", "name": "Onyx", "tag": "deep · authoritative"},
    {"id": "sage", "name": "Sage", "tag": "wise · measured"},
    {"id": "shimmer", "name": "Shimmer", "tag": "bright · cheerful"},
]

SAMPLE_TEXT = (
    "ECHO is a browser-native reading surface for listening to drafts out loud. "
    "Paste text or import a document, choose a voice profile, and hear the language "
    "back with live word tracking."
)

MAX_TTS_CHARS = 4000  # OpenAI TTS hard limit is 4096; keep buffer


# ------------------------------------------------------------------------------
# Models
# ------------------------------------------------------------------------------


class TTSRequest(BaseModel):
    text: str
    voice_id: str = "alloy"
    speed: float = 1.0


class WordTiming(BaseModel):
    word: str
    start: float  # seconds
    end: float  # seconds
    index: int


class TTSResponse(BaseModel):
    audio_base64: str
    mime: str = "audio/mpeg"
    voice_id: str
    word_count: int
    char_count: int
    words: List[WordTiming]
    estimated_duration: float


class STTResponse(BaseModel):
    id: str
    transcript: str
    created_at: str
    duration: Optional[float] = None


class ParseFileResponse(BaseModel):
    text: str
    filename: str
    word_count: int
    char_count: int


class Draft(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    text: str
    created_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )


class DraftCreate(BaseModel):
    title: str
    text: str


class Transcript(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    text: str
    duration: Optional[float] = None
    created_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )


class TranscriptCreate(BaseModel):
    text: str
    duration: Optional[float] = None


# ------------------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------------------


def _tokenize_for_timing(text: str) -> List[dict]:
    """
    Return a list of tokens with: word, index, start_char, end_char.
    Splits on whitespace while preserving character offsets for the UI to
    highlight the correct slice even when the text has punctuation.
    """
    tokens = []
    i = 0
    idx = 0
    n = len(text)
    while i < n:
        # skip whitespace
        while i < n and text[i].isspace():
            i += 1
        if i >= n:
            break
        start = i
        while i < n and not text[i].isspace():
            i += 1
        word = text[start:i]
        tokens.append(
            {"word": word, "index": idx, "start_char": start, "end_char": i}
        )
        idx += 1
    return tokens


def _estimate_word_timings(text: str) -> tuple[List[WordTiming], float]:
    """
    Estimate per-word timings using a character-weighted model.
    OpenAI TTS (tts-1, speed=1.0) averages ~15 chars/sec. We weight each word
    by (len(word)+1) and add a small boost for punctuation tails.
    """
    tokens = _tokenize_for_timing(text)
    if not tokens:
        return [], 0.0

    weights = []
    for t in tokens:
        w = t["word"]
        base = len(w) + 1
        # extra pause for sentence-ending punctuation
        if w and w[-1] in ".!?":
            base += 4
        elif w and w[-1] in ",;:":
            base += 2
        weights.append(base)

    total_weight = sum(weights)
    chars_per_sec = 15.0
    total_duration = max(total_weight / chars_per_sec, 0.5)

    cursor = 0.0
    timings: List[WordTiming] = []
    for t, w in zip(tokens, weights):
        dur = (w / total_weight) * total_duration
        timings.append(
            WordTiming(
                word=t["word"],
                start=round(cursor, 3),
                end=round(cursor + dur, 3),
                index=t["index"],
            )
        )
        cursor += dur
    return timings, round(total_duration, 3)


def _extract_pdf(data: bytes) -> str:
    from pypdf import PdfReader

    reader = PdfReader(io.BytesIO(data))
    parts = []
    for page in reader.pages:
        try:
            parts.append(page.extract_text() or "")
        except Exception as e:
            logger.warning("pdf page extract failed: %s", e)
    return "\n\n".join(p.strip() for p in parts if p and p.strip())


def _extract_docx(data: bytes) -> str:
    from docx import Document

    doc = Document(io.BytesIO(data))
    parts = [p.text for p in doc.paragraphs if p.text]
    return "\n".join(parts)


# ------------------------------------------------------------------------------
# Routes
# ------------------------------------------------------------------------------


@api_router.get("/")
async def root():
    return {"service": "echo", "status": "online"}


@api_router.get("/voices")
async def get_voices():
    return {"voices": VOICES, "default": "alloy"}


@api_router.get("/sample-text")
async def get_sample_text():
    return {"text": SAMPLE_TEXT}


@api_router.post("/tts/generate", response_model=TTSResponse)
async def generate_tts(req: TTSRequest):
    text = (req.text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text is required.")
    if len(text) > MAX_TTS_CHARS:
        raise HTTPException(
            status_code=413,
            detail=f"Text exceeds {MAX_TTS_CHARS} character limit. Split into smaller passages.",
        )

    voice_id = req.voice_id if any(v["id"] == req.voice_id for v in VOICES) else "alloy"
    speed = max(0.5, min(req.speed or 1.0, 2.0))

    try:
        audio_b64 = await tts_client.generate_speech_base64(
            text=text,
            model="tts-1",
            voice=voice_id,
            speed=speed,
            response_format="mp3",
        )
    except Exception as e:
        logger.error("TTS generation failed: %s", e)
        raise HTTPException(
            status_code=502, detail=f"TTS generation failed: {str(e)[:200]}"
        )

    timings, total_dur = _estimate_word_timings(text)
    # scale timings to account for speed (slower speed = longer audio)
    if speed and speed > 0:
        scaled = []
        for t in timings:
            scaled.append(
                WordTiming(
                    word=t.word,
                    start=round(t.start / speed, 3),
                    end=round(t.end / speed, 3),
                    index=t.index,
                )
            )
        timings = scaled
        total_dur = round(total_dur / speed, 3)

    return TTSResponse(
        audio_base64=audio_b64,
        mime="audio/mpeg",
        voice_id=voice_id,
        word_count=len(timings),
        char_count=len(text),
        words=timings,
        estimated_duration=total_dur,
    )


@api_router.post("/stt/transcribe", response_model=STTResponse)
async def transcribe(audio: UploadFile = File(...)):
    if not audio.filename:
        raise HTTPException(status_code=400, detail="Audio filename required.")

    raw = await audio.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty audio payload.")
    if len(raw) > 24 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="Audio over 24 MB. Split into shorter clips.",
        )

    # emergentintegrations' SpeechToText expects a file-like object with .name
    buf = io.BytesIO(raw)
    buf.name = audio.filename

    try:
        result = await stt_client.transcribe(
            file=buf,
            model="whisper-1",
            response_format="json",
        )
    except Exception as e:
        logger.error("Whisper transcribe failed: %s", e)
        raise HTTPException(
            status_code=502, detail=f"Transcription failed: {str(e)[:200]}"
        )

    text = getattr(result, "text", None) or (
        result.get("text") if isinstance(result, dict) else str(result)
    )
    text = (text or "").strip()

    doc = Transcript(text=text)
    await db.transcripts.insert_one(doc.dict())
    return STTResponse(
        id=doc.id,
        transcript=text,
        created_at=doc.created_at,
        duration=None,
    )


@api_router.post("/parse-file", response_model=ParseFileResponse)
async def parse_file(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename required.")

    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty file.")
    if len(raw) > 12 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File over 12 MB.")

    name = file.filename.lower()
    try:
        if name.endswith(".txt") or name.endswith(".md"):
            text = raw.decode("utf-8", errors="replace")
        elif name.endswith(".pdf"):
            text = _extract_pdf(raw)
        elif name.endswith(".docx"):
            text = _extract_docx(raw)
        else:
            raise HTTPException(
                status_code=415,
                detail="Unsupported file type. Use .txt, .md, .docx, or .pdf.",
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("parse-file failed: %s", e)
        raise HTTPException(status_code=500, detail=f"Parse failed: {str(e)[:200]}")

    text = text.strip()
    words = len([w for w in text.split() if w])
    return ParseFileResponse(
        text=text,
        filename=file.filename,
        word_count=words,
        char_count=len(text),
    )


@api_router.post("/drafts", response_model=Draft)
async def save_draft(payload: DraftCreate):
    draft = Draft(**payload.dict())
    await db.drafts.insert_one(draft.dict())
    return draft


@api_router.get("/drafts", response_model=List[Draft])
async def list_drafts():
    rows = await db.drafts.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return [Draft(**r) for r in rows]


@api_router.post("/transcripts", response_model=Transcript)
async def save_transcript(payload: TranscriptCreate):
    doc = Transcript(**payload.dict())
    await db.transcripts.insert_one(doc.dict())
    return doc


@api_router.get("/transcripts", response_model=List[Transcript])
async def list_transcripts():
    rows = (
        await db.transcripts.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    )
    return [Transcript(**r) for r in rows]


# ------------------------------------------------------------------------------
# Wire router + middleware
# ------------------------------------------------------------------------------

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    mongo_client.close()
