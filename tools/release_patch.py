from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
p=root/'assets/shoes.json'; shoes=json.loads(p.read_text())
for s in shoes:
    s['balbollRatingStatus']='editorial'
    s['balbollRatingBasis']='BALBOLL 자체 5항목 편집 평가'
    s['balbollRatingDisclosure']='BALBOLL의 자체 편집 평가 점수입니다. 5개 항목 균등 평균이며, 전문기관의 실험 측정치 또는 외부 플랫폼의 공식 평점은 아닙니다.'
    if s['slug']=='puma-velocity-nitro-4':
        s['img']='https://images.puma.net/images/311140/01/sv01/fnd/USA/w/1000/h/1000/'
        s['imageAlternates']=[
          'https://images.puma.net/images/311140/01/sv01/fnd/USA/w/800/h/800/',
          'https://images.puma.net/images/311140/01/sv01/fnd/GBR/w/1000/h/1000/',
          'https://media.rundna.com.au/1e354a70-36a9-4f58-a8e0-0a2fdcf9c771.jpg']
        s['imageSource']='PUMA 공식 제품 이미지 (스타일 311140_01)'
        s['imageSourceUrl']='https://production-eea-sfcc.puma.com/uk/en/pd/velocity-nitro%E2%84%A2-4-running-shoes-men/311140.html?dwvar_311140_color=02'
p.write_text(json.dumps(shoes,ensure_ascii=False,indent=2)+'\n')
p=root/'assets/main.js'; t=p.read_text().replace('기존 데이터 기반 임시 점수','BALBOLL 자체 평가');p.write_text(t)
p=root/'assets/balboll.js';t=p.read_text().replace('BALBOLL 추정 종합점수','BALBOLL 종합점수');p.write_text(t)
p=root/'assets/balboll-detail.js';t=p.read_text().replace('BALBOLL 성능 평가 · 추정치','BALBOLL 성능 평가').replace('현재 점수는 기존 자료와 모델 특성을 바탕으로 산정한 임시 편집 추정치입니다. RunRepeat 공식 점수와 다르며 독립 실험 검증 전입니다.','BALBOLL이 제품 특성과 공개 리뷰를 참고해 산정한 자체 편집 평가입니다. 전문기관의 실측 결과나 RunRepeat 공식 점수가 아닙니다.');p.write_text(t)
p=root/'assets/core.js';t=p.read_text().replace("if(card && shoe && shoe.brand!=='ASICS')card.classList.add('image-unavailable');", "if(card)card.classList.add('image-fallback');");p.write_text(t)
p=root/'assets/balboll.css';t=p.read_text();t+='\n/* V8 release: never hide a model solely due to image loading failures. */\n.product-card.image-unavailable,.guide-model.image-unavailable{display:flex!important}\n.product-card.image-fallback .card-photo{background:#f4f5f3!important}\n';p.write_text(t)
p=root/'tools/home-body.html';t=p.read_text().replace('기존 점수는 참고 지표입니다. 실제 출처 리뷰는 각 제품에서 별도로 확인하세요.','BALBOLL 자체 평가를 5개 항목으로 확인하세요. 산정 방식과 자료 출처는 상세 페이지에서 볼 수 있습니다.');p.write_text(t)
p=root/'tools/methodology-body.html';t=p.read_text();start=t.find('<h2>BALBOLL SCORE와 MATCH는 다릅니다</h2>');end=t.find('<p><b>MATCH:',start)
if start>=0 and end>start:
    t=t[:start]+'''<h2>BALBOLL SCORE와 MATCH는 다릅니다</h2><p><b>BALBOLL SCORE:</b> BALBOLL 자체 편집 평가입니다. 데일리·장거리·템포런·쿠셔닝·안정성 각 100점 만점, 20%씩 균등 평균해 종합점수를 계산합니다. 제품의 특성과 수록 리뷰를 참고한 편집 판단으로, 직접 측정한 실험값이나 외부 리뷰 사이트의 공식 점수가 아닙니다. 서로 다른 용도의 신발을 동일 척도로 단순 비교하는 데 한계가 있습니다. 평가 근거가 부족하면 평가 준비 중으로 표시합니다.</p>''' +t[end:]
p.write_text(t)
(root/'RELEASE_NOTES_V8.md').write_text('''# BALBOLL V8 릴리즈 안내\n\n- 제품 47개, 5개 평가 항목, 모바일 2열, 상세 장단점 유지\n- 메인과 상세의 「임시 점수」 문구를 「BALBOLL 자체 평가」로 정리\n- 점수는 외부 기관의 실측값이 아닌 BALBOLL 편집 점수임을 평가 안내에 명시\n- PUMA Velocity Nitro 4 공식 이미지 URL과 대체 URL 보강\n- 이미지 로딩 실패 시 제품 카드를 삭제하지 않고 대체 이미지로 유지\n\n## 배포 전 확인\n\n이미지 URL은 외부 호스트를 사용하므로 실제 배포 도메인에서 푸마 사진이 정상 출력되는지 확인해야 합니다. 현재 실행 환경에서 외부 이미지 파일을 직접 다운로드할 수 없어 이미지 파일의 로컬 내장은 완료되지 않았습니다. 공식 이미지의 사용 허가 및 제품 색상 일치도 운영자가 확인해야 합니다.\n\n자체 편집 점수는 독립 실험으로 검증된 수치가 아닙니다. 점수 산정 기준과 리뷰 출처를 주기적으로 보완하세요.\n''')
print('patched',len(shoes))
