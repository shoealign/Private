SHOELINEUP 배포 안내

1. ZIP을 압축 해제하세요.
2. GitHub 저장소 루트에 index.html, shoes/, assets/, compare/, sitemap.xml, robots.txt 전체를 올리세요.
3. Vercel Framework Preset: Other / Build Command: 비움 / Output Directory: 비움 또는 .
4. 기존 index.html만 교체하면 상세페이지가 작동하지 않습니다. 전체 폴더를 배포하세요.
5. 모델 정보는 assets/shoes.json을 기준으로 관리하되, 현재 사이트는 assets/shoes.js를 읽습니다. 데이터 수정 시 두 파일을 같이 갱신해야 합니다.
6. 제품별 상세주소: /shoes/제품-slug/
7. 사진은 외부 URL 의존이 있으며 미확보 모델은 대체 이미지입니다. 제품 이미지 파일을 사용 권한 확인 후 assets/에 넣고 shoes.js와 shoes.json의 img를 교체하세요.
8. 도메인 연결 후 sitemap.xml 및 canonical URL을 실제 도메인으로 바꾸세요.
