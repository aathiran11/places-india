"""
Cleans the raw 2015-16 District Information System for Education (DISE)
dataset and derives the per-capita/per-school ratio indicators used to build
the Development Score. Raw totals (e.g. "SCHTOT" = total schools) aren't
comparable across districts of very different sizes, so everything gets
converted to a rate or percentage before it's used.
"""
import pandas as pd
import numpy as np

RAW_PATH = "data/2015_16_Districtwise.csv"

# Columns we pull from the raw file. Comment shows what each represents.
RAW_COLUMNS = [
    "STATNAME", "DISTNAME",
    "TOTPOPULAT",   # total population (Census 2011)
    "P_URB_POP",    # % urban population
    "GROWTHRATE",   # population growth rate (2001-2011)
    "SEXRATIO",     # females per 1000 males
    "OVERALL_LI",   # overall literacy rate %
    "FEMALE_LIT",   # female literacy rate %
    "MALE_LIT",     # male literacy rate %
    "AREA_SQKM",    # district area
    "P_SC_POP",     # % Scheduled Caste population
    "P_ST_POP",     # % Scheduled Tribe population
    "POPULATION_0_6",  # % population age 0-6
    "SCHTOT",       # total schools
    "SWATTOT",      # schools with drinking water
    "SELETOT",      # schools with electricity
    "SBTOILTOT",    # schools with boys' toilet
    "SGTOILTOT",    # schools with girls' toilet
    "SCOMPTOT",     # schools with computer
    "TCHTOT",       # total teachers
    "ENRTOT",       # total student enrolment
]


def load_and_clean() -> pd.DataFrame:
    df = pd.read_csv(RAW_PATH, usecols=RAW_COLUMNS)

    # --- Known data-quality fix ---
    # A handful of rows (e.g. New Delhi) have P_URB_POP populated with what
    # is clearly the GROWTHRATE value instead (identical negative number in
    # both columns — a column-alignment bug in the source export). A
    # percentage can't legitimately be negative, so treat negative
    # percentages as missing rather than guessing a correction.
    for pct_col in ["P_URB_POP", "OVERALL_LI", "FEMALE_LIT", "MALE_LIT"]:
        df.loc[df[pct_col] < 0, pct_col] = np.nan

    # --- Missing value imputation ---
    # Impute with the state median first (districts in the same state tend
    # to be more similar to each other than the national average), then
    # fall back to the national median for any state that has no data at
    # all for a column.
    numeric_cols = [c for c in RAW_COLUMNS if c not in ("STATNAME", "DISTNAME")]
    for col in numeric_cols:
        df[col] = df.groupby("STATNAME")[col].transform(lambda s: s.fillna(s.median()))
        df[col] = df[col].fillna(df[col].median())

    # Drop any row still missing core population fields — can't build
    # meaningful ratios without a population denominator.
    df = df.dropna(subset=["TOTPOPULAT", "SCHTOT"]).reset_index(drop=True)

    # --- Derived ratio indicators (the actual model features) ---
    # Raw school counts (SCHTOT, SWATTOT, etc.) scale with district size, so
    # they're converted to "% of schools with X" — comparable across a tiny
    # hill district and a huge urban one.
    df["water_access_pct"] = 100 * df["SWATTOT"] / df["SCHTOT"]
    df["electricity_access_pct"] = 100 * df["SELETOT"] / df["SCHTOT"]
    df["toilet_access_pct"] = 100 * ((df["SBTOILTOT"] + df["SGTOILTOT"]) / 2) / df["SCHTOT"]
    df["computer_access_pct"] = 100 * df["SCOMPTOT"] / df["SCHTOT"]
    df["pupil_teacher_ratio"] = df["ENRTOT"] / df["TCHTOT"].replace(0, np.nan)
    df["gender_literacy_gap"] = (df["MALE_LIT"] - df["FEMALE_LIT"]).abs()
    df["population_density"] = df["TOTPOPULAT"] / df["AREA_SQKM"].replace(0, np.nan)

    # Clip a few implausible ratios (e.g. >100% from a data artifact where a
    # later-year school count exceeds an earlier-year total) to sane bounds.
    for pct_col in ["water_access_pct", "electricity_access_pct", "toilet_access_pct", "computer_access_pct"]:
        df[pct_col] = df[pct_col].clip(0, 100)
    df["pupil_teacher_ratio"] = df["pupil_teacher_ratio"].clip(upper=df["pupil_teacher_ratio"].quantile(0.99))
    df["population_density"] = df["population_density"].fillna(df["population_density"].median())
    df["population_density"] = df["population_density"].clip(upper=df["population_density"].quantile(0.99))

    return df


if __name__ == "__main__":
    df = load_and_clean()
    print(f"Cleaned dataset: {len(df)} districts, {df['STATNAME'].nunique()} states/UTs")
    print(df[["STATNAME", "DISTNAME", "OVERALL_LI", "water_access_pct", "pupil_teacher_ratio"]].head())
