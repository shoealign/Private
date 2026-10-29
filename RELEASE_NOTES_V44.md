# BALBOLL V44: compact scores & stable 3-category layout

- Running, hiking and walking share the same compact score card structure.
- Only the top-left aggregate score remains. Removed duplicate lower aggregate score.
- Score badge text color changes by band: 90+ light green, 80-89.9 mint, 70-79.9 gold, below 70 salmon, unknown gray.
- Brand and full product name occupy a single horizontal row between the image and the 5 metrics; long names clip with an ellipsis at narrow screen widths (full title available in markup).
- Shoe type is a single, height-fixed line; card-level width badges removed. Width remains available in running shoe details.
- Three categories keep the BALBOLL brand wordmark and category-navigation heights stable.
- Fixed postbuild routine that previously stripped /assets/main.js from the running listing, breaking cards on deployments.
- Hiking metrics retain their prior editorial 10-to-100 conversion; no new invented measurements. Unknown walking scores remain unknown. Do not imply that editorial scores are RunRepeat official scores.
- Product photos remain existing externally hosted URLs; loading them on every device cannot be guaranteed.
- Build and JS syntax verified. Automated browser screenshot validation was blocked by execution environment.
