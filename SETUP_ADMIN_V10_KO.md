# BALBOLL V10 관리자 설정

## 꼭 필요한 최초 1회 설정
1. https://supabase.com 에서 프로젝트를 생성합니다. 외부 Supabase 계정과 프로젝트는 이 ZIP만으로 자동 생성할 수 없습니다.
2. SQL Editor에서 `supabase/setup.sql`을 실행합니다.
3. Authentication > Users > Add user에서 **본인만의 이메일과 강력한 비밀번호**로 사용자를 만듭니다.
4. SQL Editor에서 다음을 실행합니다 (이메일 교체):
   `insert into public.balboll_admins(user_id) select id from auth.users where email='본인@이메일' on conflict do nothing;`
5. Project Settings > API에서 Project URL과 `anon` / `publishable` 공개키를 확인하여 `assets/runficial-config.js`에 입력합니다. **service_role 또는 secret 키는 절대 넣지 마세요.**
6. GitHub에 소스 업로드, Vercel 빌드 명령 `npm run build`, 출력 폴더 `public`로 배포합니다.
7. `https://사이트도메인/admin/`에 접속해 로그인합니다.

## 관리자에서 할 수 있는 일
- 기존 제품 47개의 표시 이름, 이미지 URL, 발볼 정보 수정
- 5개 평점과 평가 근거 URL 수정, 공개/비공개 전환
- 원문 리뷰 등록, 수정, 삭제, 공개/비공개 전환
- 메인 랭킹은 공개된 제품 수정 정보를 **접속할 때** 반영합니다.

## 제한 사항
- 제품 추가/삭제, 실제 이미지 파일 업로드(현재 URL만 지원), 정적 상세 페이지의 제품 기본 정보 변경은 아직 지원하지 않습니다.
- 점수 입력은 자동 검증이 아닙니다. RunRepeat/Reddit을 직접 확인하고 출처 URL을 기입해야 합니다.
- 비밀번호나 외부 서비스 키를 이 ZIP에 미리 생성/포함하는 것은 안전하지 않습니다.
- 공개 점수는 5개 항목이 모두 입력되고 근거 URL이 있는 경우에만 메인에 반영됩니다.
