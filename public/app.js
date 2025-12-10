// STUDENT
const sendBtn = document.getElementById("sendBtn");
const verifyBtn = document.getElementById("verifyBtn");

sendBtn.onclick = async () => {
  const email = document.getElementById("email").value;
  document.getElementById("studentMsg").textContent = "Sending...";
  const r = await fetch("/send-code",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email})});
  const d = await r.json();
  if(d.ok){
    document.getElementById("studentMsg").textContent="Code sent!";
    document.getElementById("otpRow").classList.remove("hidden");
  }
};

verifyBtn.onclick = async () => {
  const email = document.getElementById("email").value;
  const code = document.getElementById("otp").value;
  const r = await fetch("/verify-code",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email, code})});
  const d = await r.json();
  if(d.ok){
    document.getElementById("studentMsg").textContent="Verified!";
    document.getElementById("zoomDiv").classList.remove("hidden");
    document.getElementById("zoomLink").href = d.zoom;
  } else {
    document.getElementById("studentMsg").textContent="Wrong/Expired code";
  }
};

// ADMIN
const setLinkBtn = document.getElementById("setLinkBtn");
setLinkBtn.onclick = async () => {
  const pwd = prompt("Admin password:");
  if(pwd !== "1234") return alert("Wrong password");

  const zoom = document.getElementById("adminLink").value;
  const r = await fetch("/set-zoom",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({zoom})});
  const d = await r.json();
  if(d.ok) document.getElementById("adminMsg").textContent="Updated!";
};
