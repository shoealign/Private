# SHOELINEUP 업데이트 · 먼저 읽어주세요

이번 파일은 홈페이지 전체 업데이트입니다. 기존 저장소는 `shoealign/Private`, 현재 공개 주소는 `https://shoealign.vercel.app`을 기준으로 만들었습니다.
회원가입, 사용자 리뷰 등록, DB, 유료 외부 API는 추가하지 않았습니다.

## 아이폰 / Working Copy

1. 받은 ZIP을 파일 앱에 저장하고 한 번 눌러 압축을 풉니다.
2. 압축을 푼 폴더를 열어 **그 안의 항목 전체**를 복사합니다.
3. 파일 앱 → 둘러보기 → Working Copy → Private 안에 붙여넣습니다.
   - Working Copy가 ‘위치’로 표시될 수 있습니다. 반드시 Clone한 Private 저장소 안으로 복사하세요.
   - 기존 파일은 대치/병합합니다. ZIP 또는 압축 해제 폴더 자체를 저장소 안에 넣는 것이 아닙니다.
   - `index.html`, `assets`, `shoes`, `compare`, `tools`, `package.json`, `vercel.json`이 Private 바로 아래에 있어야 합니다.
   - 이번에는 항목 수가 예전 9개와 다릅니다. 폴더 안까지 하나씩 열어 올릴 필요는 없습니다.
4. Working Copy → Private → Repository → Commit에서 변경된 파일 전체를 선택합니다.
5. 메시지를 `SHOELINEUP UX and compare update`로 입력하고 Commit → Push합니다.
6. Vercel 최신 배포가 Ready로 바뀌면 확인합니다.

## 확인할 화면

- 메인: https://shoealign.vercel.app/
- 비교: https://shoealign.vercel.app/compare/
- 메가블라스트: https://shoealign.vercel.app/shoes/asics-megablast/
- 점수/자료 안내: https://shoealign.vercel.app/methodology/

비교는 메인에서 2개를 담은 뒤 여는 것이 가장 간단합니다.
내 러닝화 찾기를 완료한 뒤 정렬이 MATCH 순으로 바뀌는지도 확인해 주세요.

## Vercel에서 배포가 실패하거나 예전 화면이 보일 때

이번 파일의 `vercel.json`에 다음 설정을 넣었습니다.
- Framework: Other (특정 프레임워크 사용 안 함)
- Build Command: node tools/build.mjs
- Output Directory: public
- Install Command: echo "No dependencies to install"

기존 프로젝트 설정에 다른 값이 강제로 지정되어 있거나 Root Directory가 하위 폴더를 가리키면 충돌할 수 있습니다.
Vercel 프로젝트 설정에서 Root Directory는 저장소 최상위로 두고, 위 값을 확인하세요.
오류가 생겼을 때 새 프로젝트를 만들거나 기존 저장소를 지울 필요는 없습니다. Build Logs부터 확인하세요.

`node`, 코딩 앱, 데이터베이스를 아이폰에 따로 설치할 필요는 없습니다.
사이트 페이지 생성은 Vercel 배포 과정에서 실행됩니다.

## 다음부터 제품 정보 고치는 곳은 한 곳

`assets/shoes.json`이 제품 데이터 원본입니다.
이 파일을 수정하고 Push하면 메인용 데이터와 51개 상세페이지를 빌드가 다시 만듭니다.
`assets/shoes.js`나 제품별 HTML을 각각 수정하지 마세요. 다음 빌드에 덮어쓰게 됩니다.

- 화면 스타일: assets/site.css
- 메인/검색/추천 동작: assets/main.js
- 비교 동작: assets/compare.js
- 공통 함수: assets/core.js
- 상세페이지 틀: tools/views.cjs
- 도메인을 바꿀 때: site.config.json의 siteUrl 변경

사진 파일을 확보하면 `assets/images/모델명.webp`로 저장하고 해당 제품의 `img`를 `/assets/images/모델명.webp`로 바꾸면 됩니다.
그 후 카드·상세·비교·한눈에 보기에서 같은 이미지를 사용합니다.

## 중요한 한계

이번 업데이트는 사용성과 데이터 표시 구조 개선입니다.
51개 사진을 모두 다운로드해 넣은 파일이 아닙니다. 외부 사진 주소와 기존 대체 이미지가 남아 있습니다.
발매가, 출시일, 사이즈, 리뷰 내용 전체를 이번에 다시 검증한 것도 아닙니다.
기존 점수는 참고값으로 표시하고 실제 측정치나 구매자 평균이라고 표시하지 않았습니다.
