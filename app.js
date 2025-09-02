/* ===========================
   뉴스 데이터 (샘플)
   실제 서비스에선 API/시트/JSON으로 대체 가능
=========================== */
const ARTICLES = [
  {
    id: "vn-esports",
    date: "2025-06-24",
    title: "베트남에서 축구보다 e스포츠가 인기라고?",
    source: "Careet",
    tags: ["e스포츠","Z세대","베트남"],
    summary:
      "베트남 MZ의 여가 소비가 오프라인 경기 관람에서 디지털 관람으로 이동. PC방·모바일 게임 생태계와 로컬 리그의 성장으로 e스포츠 인기도가 급상승.",
    bullets: [
      "국가·지자체 후원이 리그 인프라를 견인, 스폰서 유입↑",
      "축구 대비 ‘참여 장벽↓·실시간 상호작용↑’이 강점",
      "브랜드는 팀 후원 외, 스트리머 협업·굿즈·팝업으로 확장 가능"
    ],
    link: "https://example.com/vn-esports-original"
  },
  {
    id: "sg-no-alcohol-club",
    date: "2025-06-24",
    title: "‘술 없는 클럽’ 찾는 싱가포르 Z세대",
    source: "Careet",
    tags: ["건강트렌드","로컬씬"],
    summary:
      "싱가포르의 일부 클럽·라이브바가 논알콜 라인업을 확대. ‘웰니스+클럽’ 조합이 주류 소비 감소 트렌드와 맞물리며 Z세대 발길을 끌고 있음.",
    bullets: [
      "DJ 셋과 브레스워크, 요가 클래스를 결합한 심야 웰니스",
      "논알콜 칵테일 단가를 프리미엄화하여 객단가 방어",
      "브랜드 콜라보: RTD(Ready-To-Drink) 논알콜 한정 출시"
    ],
    link: "https://example.com/sg-no-alcohol"
  },
  {
    id: "shorts-commerce",
    date: "2025-06-25",
    title: "숏폼 커머스, 구매 전환의 결정적 순간은 ‘댓글’",
    source: "Creator Economy Weekly",
    tags: ["쇼트폼","커머스","UGC"],
    summary:
      "짧은 영상 내 콜투액션보다 댓글 고정·고객 Q&A 응답이 전환에 더 유의미. 라이브 전(前) 티징 댓글 운영이 재방문률을 끌어올림.",
    bullets: [
      "댓글 상단 고정: 쿠폰·링크·FAQ를 카드처럼 운용",
      "리뷰 리포스트로 신뢰도 강화(UGC 루프)",
      "영상-댓글-라이브로 이어지는 3단 전환 플로우"
    ],
    link: "https://example.com/shorts-commerce"
  }
];

/* ============ 유틸 ============ */
const fmtDate = (iso) => {
  const d = new Date(iso + "T00:00:00");
  const yoil = ["일","월","화","수","목","금","토"][d.getDay()];
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const day = String(d.getDate()).padStart(2,"0");
  return `${y}.${m}.${day} ${yoil}요일`;
};
const groupBy = (arr, key) => arr.reduce((m, x)=>((m[x[key]] ??= []).push(x), m), {});

const groupsEl = document.getElementById("groups");
const emptyMsg = document.getElementById("emptyMsg");
const toast = document.getElementById("toast");

/* ============ 렌더링 ============ */
function render(list){
  groupsEl.innerHTML = "";
  const byDate = groupBy(list, "date");
  const dates = Object.keys(byDate).sort((a,b)=>a<b?1:-1); // 최신순

  for(const date of dates){
    // 날짜 라인
    const dl = document.createElement("div");
    dl.className = "date-line";
    dl.textContent = fmtDate(date);
    groupsEl.appendChild(dl);

    // 당일 묶음
    const wrap = document.createElement("section");
    wrap.className = "clips";
    groupsEl.appendChild(wrap);

    for(const item of byDate[date]){
      wrap.appendChild(makeClip(item));
    }
  }
  emptyMsg.style.display = list.length ? "none" : "block";
}

function makeClip(item){
  const art = document.createElement("article");
  art.className = "clip";
  art.id = item.id;
  art.setAttribute("aria-expanded","false");

  const btn = document.createElement("button");
  btn.className = "clip__toggle";
  btn.setAttribute("aria-controls", `${item.id}-panel`);
  btn.id = `${item.id}-button`;
  btn.innerHTML = `
    <div>
      <div class="clip__title">${item.title}</div>
      <div class="clip__metaTop">${fmtDate(item.date)}</div>
    </div>
    <svg class="chev" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  const wrap = document.createElement("div");
  wrap.className = "clip__wrap";

  const panel = document.createElement("div");
  panel.className = "clip__panel";
  panel.id = `${item.id}-panel`;
  panel.setAttribute("role","region");
  panel.setAttribute("aria-labelledby", btn.id);
  panel.innerHTML = `
    <div class="clip__meta">출처: ${item.source || "출처 미기재"}</div>
    <div class="clip__content">
      <p>${item.summary}</p>
      ${item.tags?.length ? item.tags.map(t=>`<span class="tag">#${t}</span>`).join("") : ""}
      ${item.bullets?.length ? `<ul>${item.bullets.map(b=>`<li>${b}</li>`).join("")}</ul>` : ""}
    </div>
    <div class="clip__actions">
      <a class="btn btn--accent" href="${item.link}" target="_blank" rel="noopener">원문 보기</a>
      <button class="btn" data-copy>링크 복사</button>
    </div>
  `;
  wrap.appendChild(panel);

  // 토글
  btn.addEventListener("click", () => toggleClip(art, wrap));
  // 링크 복사
  panel.querySelector("[data-copy]").addEventListener("click", async (e) => {
    e.stopPropagation();
    const url = `${location.origin}${location.pathname}#${item.id}`;
    try{
      await navigator.clipboard.writeText(url);
      showToast("링크가 복사되었어요");
      history.replaceState(null, "", "#"+item.id);
    }catch{
      showToast("복사에 실패했어요");
    }
  });

  art.appendChild(btn);
  art.appendChild(wrap);
  return art;
}

function toggleClip(art, wrap){
  const isOpen = art.getAttribute("aria-expanded")==="true";
  const SINGLE_OPEN = true; // 한 번에 하나만
  if(SINGLE_OPEN && !isOpen){
    document.querySelectorAll(".clip[aria-expanded='true']").forEach(el=>{
      collapse(el, el.querySelector(".clip__wrap"));
    });
  }
  isOpen ? collapse(art, wrap) : expand(art, wrap);
}
function expand(art, wrap){
  art.setAttribute("aria-expanded","true");
  wrap.style.maxHeight = wrap.scrollHeight + "px";
  history.replaceState(null, "", "#"+art.id);
}
function collapse(art, wrap){
  art.setAttribute("aria-expanded","false");
  wrap.style.maxHeight = wrap.scrollHeight + "px";
  requestAnimationFrame(()=> wrap.style.maxHeight = "0");
}

/* ===== 검색 ===== */
const input = document.getElementById("searchInput");
input.addEventListener("input", () => {
  const q = input.value.trim().toLowerCase();
  if(!q){ render(ARTICLES); return; }
  const filtered = ARTICLES.filter(a =>
    [a.title, a.summary, ...(a.tags||[])]
      .join(" ")
      .toLowerCase()
      .includes(q)
  );
  render(filtered);
});

/* ===== 토스트 ===== */
function showToast(msg){
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(()=>t.classList.remove("show"), 1600);
}

/* 초기 렌더 + 해시 열기 */
render(ARTICLES);
window.addEventListener("load", ()=>{
  const id = location.hash.replace("#","");
  if(id){
    const target = document.getElementById(id);
    if(target){
      const wrap = target.querySelector(".clip__wrap");
      expand(target, wrap);
      setTimeout(()=> target.scrollIntoView({block:"start", behavior:"smooth"}), 60);
    }
  }
});
