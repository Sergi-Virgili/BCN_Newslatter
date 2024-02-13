"use strict";

const url = "https://x5qhgu4uu7.execute-api.eu-west-1.amazonaws.com/register";

const headers = {
  "Content-Type": "application/json",
  //add origin
};

const form = document
  .querySelector("form")
  .addEventListener("submit", emailSend);

async function emailSend(e) {
  e.preventDefault();

  await sendEmail(e.target.email.value);
  uiStatus("sended");
}

async function sendEmail(email) {
  uiStatus("loading");

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({ email }),
  });
  // Verifica si la respuesta es exitosa
  if (!response.ok) {
    const errorText = await response.text(); // Intenta leer el cuerpo de la respuesta para más detalles
    uiStatus("error");
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  console.log(data.message);
}

const uiStatus = (status) => {
  if (status === "loading") {
    document.querySelector(".form").classList.toggle("hidden");
    document.querySelector(".spinner").classList.toggle("hidden");
  }
  if (status == "sended" || status === "error") {
    document.querySelector(".form").classList.toggle("hidden");
    document.querySelector(".spinner").classList.toggle("hidden");
  }
};
