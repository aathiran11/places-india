"""
Two-stage approach to the Development Score, and why:

There's no ground-truth "development score" column in government data — it's
always a derived index (this is also true of real indices like the HDI). So:

  Stage 1 (unsupervised): normalize a set of "higher = better" indicators and
  combine them into one score using PCA (Principal Component Analysis) — take
  the first principal component, which captures the dominant shared pattern
  of variation across all the indicators, and rescale it to 0-100. This *is*
  a real, standard technique for building composite indices from multiple
  correlated variables.

  Stage 2 (supervised): train a Random Forest regressor to predict that PCA
  score from the raw underlying features, with a genuine 80/20 train/test
  split. This has real practical value: it lets you estimate the Development
  Score for a place even if you're missing some of the input indicators (as
  long as you have enough of the others), and it gives interpretable feature
  importances — which indicators actually drive the score the most.

Honesty check: the supervised model in Stage 2 is deliberately given a
DIFFERENT set of features than what built the Stage-1 score (see
MODEL_FEATURES vs INDEX_INDICATORS below) — population, growth rate, area,
social composition — none of which include literacy or school-infrastructure
access. If it were given the same features used to build the score, it
would trivially reconstruct a near-identical number, which would be
methodologically dishonest to call "prediction." With disjoint features, the
reported R² and MAE reflect a genuine (and harder) question: how much can
population/demographic/scale characteristics alone tell you about a
district's development level, without seeing its literacy or infrastructure
data directly?
"""
import json
import numpy as np
import pandas as pd
import joblib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from sklearn.preprocessing import MinMaxScaler
from sklearn.decomposition import PCA
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_absolute_error

from clean_data import load_and_clean

# Indicators that feed the PCA composite index. Each is oriented so that a
# HIGHER value = better outcome (pupil_teacher_ratio and gender_literacy_gap
# are inverted below since lower is better for those two).
INDEX_INDICATORS = [
    "OVERALL_LI",
    "P_URB_POP",
    "water_access_pct",
    "electricity_access_pct",
    "toilet_access_pct",
    "computer_access_pct",
    "pupil_teacher_ratio",   # inverted: lower ratio = more teacher attention
    "gender_literacy_gap",   # inverted: lower gap = better gender equity
    "SEXRATIO",
]

# Features the supervised model is allowed to use to predict the score.
# IMPORTANT: this set is deliberately DISJOINT from INDEX_INDICATORS above.
# If the model could see the same literacy/infrastructure-access features
# used to build the score, it would trivially "predict" a near-identical
# number back — that's reconstruction, not prediction. Instead the model
# only gets demographic/scale features (population, growth, area, social
# composition) and has to learn whether those alone are informative about
# development outcomes — a genuinely harder, more honest task.
MODEL_FEATURES = [
    "TOTPOPULAT",
    "GROWTHRATE",
    "AREA_SQKM",
    "P_SC_POP",
    "P_ST_POP",
    "POPULATION_0_6",
    "population_density",
    "SCHTOT",
]


def build_development_score(df: pd.DataFrame):
    work = df[INDEX_INDICATORS].copy()
    # Invert "lower is better" indicators so every column points the same
    # direction (higher = better) before combining them.
    work["pupil_teacher_ratio"] = -work["pupil_teacher_ratio"]
    work["gender_literacy_gap"] = -work["gender_literacy_gap"]

    scaler = MinMaxScaler()
    scaled = scaler.fit_transform(work)

    pca = PCA(n_components=1)
    component = pca.fit_transform(scaled).ravel()

    # Rescale the raw PCA component to a readable 0-100 range.
    score = 100 * (component - component.min()) / (component.max() - component.min())

    explained_variance = float(pca.explained_variance_ratio_[0])
    loadings = dict(zip(INDEX_INDICATORS, pca.components_[0].tolist()))

    return score, scaler, pca, explained_variance, loadings


def train_supervised_model(df: pd.DataFrame, score: np.ndarray):
    X = df[MODEL_FEATURES]
    y = score

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = RandomForestRegressor(
        n_estimators=300, max_depth=8, min_samples_leaf=3, random_state=42
    )
    model.fit(X_train, y_train)

    preds_test = model.predict(X_test)
    r2 = r2_score(y_test, preds_test)
    mae = mean_absolute_error(y_test, preds_test)

    importances = dict(
        sorted(zip(MODEL_FEATURES, model.feature_importances_.tolist()), key=lambda x: -x[1])
    )

    return model, {
        "r2_test": float(r2),
        "mae_test": float(mae),
        "n_train": len(X_train),
        "n_test": len(X_test),
        "feature_importances": importances,
    }, (y_test, preds_test)


def main():
    df = load_and_clean()
    score, scaler, pca, explained_var, loadings = build_development_score(df)
    df["development_score"] = score

    model, metrics, (y_test, preds_test) = train_supervised_model(df, score)

    print(f"Trained on {metrics['n_train']} districts, tested on {metrics['n_test']}")
    print(f"Test R²:  {metrics['r2_test']:.3f}")
    print(f"Test MAE: {metrics['mae_test']:.2f} points (on a 0-100 scale)")
    print(f"PCA explained variance (1 component): {explained_var:.1%}")
    print()
    print("Top 5 feature importances:")
    for k, v in list(metrics["feature_importances"].items())[:5]:
        print(f"  {k}: {v:.3f}")

    # --- Save model artifacts ---
    joblib.dump(model, "model/development_score_model.joblib")
    joblib.dump(scaler, "model/pca_scaler.joblib")
    joblib.dump(pca, "model/pca.joblib")

    with open("model/metrics.json", "w") as f:
        json.dump(
            {
                "metrics": metrics,
                "pca_explained_variance": explained_var,
                "pca_loadings": loadings,
                "index_indicators": INDEX_INDICATORS,
                "model_features": MODEL_FEATURES,
            },
            f,
            indent=2,
        )

    # Ranked district table for reference/spot-checking
    ranked = df[["STATNAME", "DISTNAME", "development_score"]].sort_values(
        "development_score", ascending=False
    )
    ranked.to_csv("outputs/district_development_scores.csv", index=False)

    # --- Plots ---
    plt.figure(figsize=(6, 6))
    plt.scatter(y_test, preds_test, alpha=0.6, color="#7A1F2B")
    plt.plot([0, 100], [0, 100], "--", color="#C99A3B")
    plt.xlabel("Actual Development Score (PCA)")
    plt.ylabel("Predicted Development Score (Random Forest)")
    plt.title(f"Predicted vs Actual (Test Set)\nR² = {metrics['r2_test']:.3f}, MAE = {metrics['mae_test']:.2f}")
    plt.tight_layout()
    plt.savefig("outputs/predicted_vs_actual.png", dpi=140)
    plt.close()

    plt.figure(figsize=(8, 5))
    items = list(metrics["feature_importances"].items())
    labels = [k for k, _ in items][::-1]
    values = [v for _, v in items][::-1]
    plt.barh(labels, values, color="#C99A3B")
    plt.xlabel("Importance")
    plt.title("Feature Importance — Development Score Model")
    plt.tight_layout()
    plt.savefig("outputs/feature_importance.png", dpi=140)
    plt.close()

    print("\nSaved model, metrics, ranked CSV, and plots to model/ and outputs/")


if __name__ == "__main__":
    main()
