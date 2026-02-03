// GDP per capita, PPP (current international $) — World Bank indicator NY.GDP.PCAP.PP.CD
// Source: World Bank / ICP PPPs (as distributed in WDI).
// Years averaged: 2022–2024 (matches WHR 2025 three-year averaging window).
// GDP is measured as GDP per capita adjusted for purchasing power parity (PPP) from the World Bank, averaged over 2022–2024 to match the three-year averaging window used by the World Happiness Report 2025.

//Maybe keep this, maybe not

export const incomeEuropePPP = [
  { country: "Austria", iso2: "AT", gdpPPP_2022: 70735, gdpPPP_2023: 70479, gdpPPP_2024: 71622, gdpPPP_avg: 70945 },
  { country: "Belgium", iso2: "BE", gdpPPP_2022: 68158, gdpPPP_2023: 69103, gdpPPP_2024: 72237, gdpPPP_avg: 69833 },
  { country: "Bulgaria", iso2: "BG", gdpPPP_2022: 35815, gdpPPP_2023: 37435, gdpPPP_2024: 41520, gdpPPP_avg: 38257 },
  { country: "Croatia", iso2: "HR", gdpPPP_2022: 41958, gdpPPP_2023: 46268, gdpPPP_2024: 48817, gdpPPP_avg: 45681 },
  { country: "Cyprus", iso2: "CY", gdpPPP_2022: 54851, gdpPPP_2023: 57327, gdpPPP_2024: 61272, gdpPPP_avg: 57817 },
  { country: "Czechia", iso2: "CZ", gdpPPP_2022: 52352, gdpPPP_2023: 53441, gdpPPP_2024: 55819, gdpPPP_avg: 53871 },
  { country: "Denmark", iso2: "DK", gdpPPP_2022: 74646, gdpPPP_2023: 76013, gdpPPP_2024: 79993, gdpPPP_avg: 76884 },
  { country: "Estonia", iso2: "EE", gdpPPP_2022: 45439, gdpPPP_2023: 47476, gdpPPP_2024: 50998, gdpPPP_avg: 47971 },
  { country: "Finland", iso2: "FI", gdpPPP_2022: 60868, gdpPPP_2023: 62327, gdpPPP_2024: 64053, gdpPPP_avg: 62416 },
  { country: "France", iso2: "FR", gdpPPP_2022: 56824, gdpPPP_2023: 58201, gdpPPP_2024: 60696, gdpPPP_avg: 58540 },
  { country: "Germany", iso2: "DE", gdpPPP_2022: 68094, gdpPPP_2023: 69200, gdpPPP_2024: 72295, gdpPPP_avg: 69863 },
  { country: "Greece", iso2: "GR", gdpPPP_2022: 39422, gdpPPP_2023: 41048, gdpPPP_2024: 43679, gdpPPP_avg: 41383 },
  { country: "Hungary", iso2: "HU", gdpPPP_2022: 43787, gdpPPP_2023: 45402, gdpPPP_2024: 47827, gdpPPP_avg: 45672 },
  { country: "Iceland", iso2: "IS", gdpPPP_2022: 75358, gdpPPP_2023: 77831, gdpPPP_2024: 80356, gdpPPP_avg: 77848 },
  { country: "Ireland", iso2: "IE", gdpPPP_2022: 124062, gdpPPP_2023: 130040, gdpPPP_2024: 137607, gdpPPP_avg: 130570 },
  { country: "Italy", iso2: "IT", gdpPPP_2022: 56605, gdpPPP_2023: 57908, gdpPPP_2024: 60420, gdpPPP_avg: 58344 },
  { country: "Latvia", iso2: "LV", gdpPPP_2022: 40313, gdpPPP_2023: 41652, gdpPPP_2024: 43446, gdpPPP_avg: 41804 },
  { country: "Lithuania", iso2: "LT", gdpPPP_2022: 50242, gdpPPP_2023: 51639, gdpPPP_2024: 53943, gdpPPP_avg: 51941 },
  { country: "Luxembourg", iso2: "LU", gdpPPP_2022: 141275, gdpPPP_2023: 145118, gdpPPP_2024: 150345, gdpPPP_avg: 145579 },
  { country: "Malta", iso2: "MT", gdpPPP_2022: 61813, gdpPPP_2023: 64378, gdpPPP_2024: 67471, gdpPPP_avg: 64521 },
  { country: "Netherlands", iso2: "NL", gdpPPP_2022: 77342, gdpPPP_2023: 79506, gdpPPP_2024: 82730, gdpPPP_avg: 79893 },
  { country: "Norway", iso2: "NO", gdpPPP_2022: 103112, gdpPPP_2023: 107680, gdpPPP_2024: 113826, gdpPPP_avg: 108206 },
  { country: "Poland", iso2: "PL", gdpPPP_2022: 45957, gdpPPP_2023: 47490, gdpPPP_2024: 49929, gdpPPP_avg: 47792 },
  { country: "Portugal", iso2: "PT", gdpPPP_2022: 46241, gdpPPP_2023: 47185, gdpPPP_2024: 49206, gdpPPP_avg: 47544 },
  { country: "Romania", iso2: "RO", gdpPPP_2022: 43747, gdpPPP_2023: 45359, gdpPPP_2024: 47076, gdpPPP_avg: 45394 },
  { country: "Slovakia", iso2: "SK", gdpPPP_2022: 42771, gdpPPP_2023: 44041, gdpPPP_2024: 45415, gdpPPP_avg: 44076 },
  { country: "Slovenia", iso2: "SI", gdpPPP_2022: 52071, gdpPPP_2023: 53788, gdpPPP_2024: 55774, gdpPPP_avg: 53844 },
  { country: "Spain", iso2: "ES", gdpPPP_2022: 51820, gdpPPP_2023: 53393, gdpPPP_2024: 55359, gdpPPP_avg: 53524 },
  { country: "Sweden", iso2: "SE", gdpPPP_2022: 66413, gdpPPP_2023: 67612, gdpPPP_2024: 70542, gdpPPP_avg: 68222 },
  { country: "Switzerland", iso2: "CH", gdpPPP_2022: 88576, gdpPPP_2023: 91492, gdpPPP_2024: 95873, gdpPPP_avg: 91980 },
  { country: "United Kingdom", iso2: "GB", gdpPPP_2022: 57451, gdpPPP_2023: 58779, gdpPPP_2024: 60851, gdpPPP_avg: 59027 }
];
