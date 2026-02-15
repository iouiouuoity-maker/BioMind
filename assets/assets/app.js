const STORE_KEY = "biomind_results_v1";

function $(id){ return document.getElementById(id); }

function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

function saveResult(entry){
  const data = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
  data.unshift(entry);
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

function drawBar(canvasId, percent){
  const c = $(canvasId);
  if(!c) return;
  const ctx = c.getContext("2d");
  // clear
  ctx.clearRect(0,0,c.width,c.height);

  // axis
  ctx.fillStyle = "#17324a";
  ctx.font = "14px system-ui";
  ctx.fillText("Нәтиже (%)", 10, 20);

  // bar
  const w = c.width, h = c.height;
  const barH = Math.max(0, Math.min(100, percent)) * (h-60) / 100;
  ctx.fillStyle = "#4aa3ff";
  ctx.fillRect(40, h-30-barH, 80, barH);

  // label
  ctx.fillStyle = "#17324a";
  ctx.fillText(percent + "%", 45, h-35-barH);
}

function renderTest(moduleData){
  // moduleData: {grade, topic, theory, extra, iframe, bank:[{q, options[], correct}]}
  $("moduleTitle").textContent = `${moduleData.grade}-сынып — ${moduleData.topic}`;
  $("theoryText").textContent = moduleData.theory;
  $("extraText").textContent = moduleData.extra;

  const iframe = $("videoFrame");
  iframe.src = moduleData.iframe;
  iframe.setAttribute("allowfullscreen","true");

  // random 10 from 20
  const picked = shuffle(moduleData.bank).slice(0,10);
  window.__picked = picked;
  const box = $("testArea");
  box.innerHTML = "";

  picked.forEach((item, idx) => {
    const wrap = document.createElement("div");
    wrap.className = "q";
    wrap.innerHTML = `
      <h4>${idx+1}) ${item.q}</h4>
      ${item.options.map((opt,i)=>`
        <label class="opt">
          <input type="radio" name="q_${idx}" value="${i}">
          <span>${opt}</span>
        </label>
      `).join("")}
    `;
    box.appendChild(wrap);
  });

  $("regenBtn").onclick = () => renderTest(moduleData);

  $("checkBtn").onclick = () => {
    const name = $("studentName").value.trim();
    if(!name){
      alert("Оқушы аты-жөні міндетті.");
      return;
    }

    let score = 0;
    picked.forEach((item, idx) => {
      const chosen = document.querySelector(`input[name="q_${idx}"]:checked`);
      if(chosen && Number(chosen.value) === item.correct) score++;
    });

    const total = picked.length;
    const percent = Math.round((score/total)*100);

    $("resultText").innerHTML = `<b>${percent}%</b> — ${score}/${total} дұрыс`;
    drawBar("chartCanvas", percent);

    saveResult({
      ts: new Date().toISOString(),
      student: name,
      grade: moduleData.grade,
      topic: moduleData.topic,
      score,
      total,
      percent
    });

    $("afterSaveNote").textContent = "Нәтиже сақталды. Мұғалім бетінде көрінеді.";
  };
}

// Teacher page helpers
function loadAllResults(){
  return JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
}

function clearAllResults(){
  localStorage.removeItem(STORE_KEY);
}
