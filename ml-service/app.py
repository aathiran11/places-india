"""
Prediction API wrapping both trained models: Development Score (regression)
and Growth Classification (Slow/Stable/Rapid).
Run standalone: uvicorn app:app --port 8000

Endpoints:
  GET  /health
  POST /predict              — Development Score (0-100)
  POST /predict-growth-class — Growth trajectory (Slow / Declining, Stable, Rapid Growth)
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import pandas as pd

DEV_SCORE_FEATURES = [
    "TOTPOPULAT",
    "GROWTHRATE",
    "AREA_SQKM",
    "P_SC_POP",
    "P_ST_POP",
    "POPULATION_0_6",
    "population_density",
    "SCHTOT",
]

GROWTH_CLASS_FEATURES = [
    "TOTPOPULAT",
    "AREA_SQKM",
    "P_SC_POP",
    "P_ST_POP",
    "POPULATION_0_6",
    "population_density",
    "SCHTOT",
    "OVERALL_LI",
]

app = FastAPI(title="PlacesIndia ML API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

dev_score_model = joblib.load("model/development_score_model.joblib")
growth_class_model = joblib.load("model/growth_class_model.joblib")


class PredictRequest(BaseModel):
    population: float = Field(..., gt=0, description="Total population (Census)")
    growth_rate: float = Field(..., description="Population growth rate %, decade-over-decade")
    area_sqkm: float = Field(..., gt=0, description="District area in sq. km")
    sc_pop: float = Field(..., ge=0, le=100, description="% Scheduled Caste population")
    st_pop: float = Field(..., ge=0, le=100, description="% Scheduled Tribe population")
    pop_0_6: float = Field(..., ge=0, le=100, description="% population age 0-6")
    schools: float = Field(..., ge=0, description="Total number of schools")


class PredictResponse(BaseModel):
    development_score: float
    model_confidence_note: str


class GrowthClassRequest(BaseModel):
    population: float = Field(..., gt=0, description="Total population (Census)")
    area_sqkm: float = Field(..., gt=0, description="District area in sq. km")
    sc_pop: float = Field(..., ge=0, le=100, description="% Scheduled Caste population")
    st_pop: float = Field(..., ge=0, le=100, description="% Scheduled Tribe population")
    pop_0_6: float = Field(..., ge=0, le=100, description="% population age 0-6")
    schools: float = Field(..., ge=0, description="Total number of schools")
    literacy_rate: float = Field(..., ge=0, le=100, description="Overall literacy rate %")


class GrowthClassResponse(BaseModel):
    growth_class: str
    class_probabilities: dict
    model_confidence_note: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    try:
        density = req.population / req.area_sqkm
        row = pd.DataFrame(
            [[req.population, req.growth_rate, req.area_sqkm, req.sc_pop, req.st_pop,
              req.pop_0_6, density, req.schools]],
            columns=DEV_SCORE_FEATURES,
        )
        score = float(dev_score_model.predict(row)[0])
        score = max(0.0, min(100.0, score))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    return PredictResponse(
        development_score=round(score, 1),
        model_confidence_note=(
            "Trained on demographic/scale data only (no literacy or infrastructure "
            "inputs) with test R²=0.52 and MAE≈11 points — treat as a rough estimate, "
            "not a precise score."
        ),
    )


@app.post("/predict-growth-class", response_model=GrowthClassResponse)
def predict_growth_class(req: GrowthClassRequest):
    try:
        density = req.population / req.area_sqkm
        row = pd.DataFrame(
            [[req.population, req.area_sqkm, req.sc_pop, req.st_pop,
              req.pop_0_6, density, req.schools, req.literacy_rate]],
            columns=GROWTH_CLASS_FEATURES,
        )
        predicted_class = growth_class_model.predict(row)[0]
        probs = growth_class_model.predict_proba(row)[0]
        class_probs = dict(zip(growth_class_model.classes_, [round(float(p), 3) for p in probs]))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    return GrowthClassResponse(
        growth_class=predicted_class,
        class_probabilities=class_probs,
        model_confidence_note=(
            "Test accuracy 58.8% across 3 balanced classes (baseline 33.3% = random "
            "guessing) — meaningfully better than chance, but far from certain. "
            "'Stable' is the hardest class to call correctly."
        ),
    )
