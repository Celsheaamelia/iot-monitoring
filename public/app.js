let chart;

function initChart() {
  const ctx = document.getElementById("sensorChart").getContext("2d");

  const gradient = (color) => {
    const g = ctx.createLinearGradient(0, 0, 0, 280);
    g.addColorStop(0, color + "55");
    g.addColorStop(1, color + "00");
    return g;
  };
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Suhu (°C)",
          borderColor: "#d9480f",
          backgroundColor: gradient("#d9480f"),
          data: [],
          fill: true,
          tension: 0.4,
          borderWidth: 2.5,
          pointRadius: 0,
          pointHoverRadius: 5,
        },
        {
          label: "Kelembapan (%)",
          borderColor: "#1f8a4c",
          backgroundColor: gradient("#1f8a4c"),
          data: [],
          fill: true,
          tension: 0.4,
          borderWidth: 2.5,
          pointRadius: 0,
          pointHoverRadius: 5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          position: "top",
          align: "end",
          labels: {
            usePointStyle: true,
            boxWidth: 8,
            font: { family: "Plus Jakarta Sans", weight: "600" },
          },
        },
        tooltip: {
          backgroundColor: "#0b2e1f",
          padding: 12,
          cornerRadius: 10,
          titleFont: { family: "Plus Jakarta Sans", weight: "700" },
          bodyFont: { family: "Plus Jakarta Sans" },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { maxTicksLimit: 8, color: "#5d7566" },
        },
        y: {
          grid: { color: "#e3f5ea" },
          border: { display: false },
          ticks: { color: "#5d7566" },
        },
      },
    },
  });
}

async function updateDashboard() {
  try {
    // 1. Ambil data terbaru
    const resLatest = await fetch("/api/readings/latest");
    const latest = await resLatest.json();

    if (latest && latest.created_at) {
      document.getElementById("val-suhu").innerText = latest.suhu;
      document.getElementById("val-kelembapan").innerText = latest.kelembapan;

      // Bar kelembapan (0-100%)
      const persen = Math.max(0, Math.min(100, Number(latest.kelembapan)));
      document.getElementById("bar-kelembapan").style.width = persen + "%";

      const lastTime = new Date(latest.created_at + "Z"); // parse UTC timestamp
      document.getElementById("time-suhu").innerText =
        lastTime.toLocaleTimeString();
      document.getElementById("time-kelembapan").innerText =
        lastTime.toLocaleTimeString();

      // Cek Status Panas / Normal (> 35 °C)
      const cardSuhu = document.getElementById("card-suhu");
      const statusSuhu = document.getElementById("status-suhu");
      if (latest.suhu > 35) {
        cardSuhu.classList.add("panas");
        statusSuhu.innerText = "Panas";
      } else {
        cardSuhu.classList.remove("panas");
        statusSuhu.innerText = "Normal";
      }

      // Cek Indikator Online/Offline (< 30 detik)
      const now = new Date();
      const diffSeconds = (now - lastTime) / 1000;
      const elStatus = document.getElementById("status-perangkat");
      if (diffSeconds < 30) {
        elStatus.innerText = "Online";
        elStatus.className = "badge online";
      } else {
        elStatus.innerText = "Offline";
        elStatus.className = "badge offline";
      }
    }

    // 2. Ambil 20 data terakhir untuk grafik & tabel
    const resHistory = await fetch("/api/readings?limit=20");
    const history = await resHistory.json();

    // Urutkan kronologis (terlama ke terbaru) untuk grafik
    const sorted = [...history].reverse();
    chart.data.labels = sorted.map((item) =>
      new Date(item.created_at + "Z").toLocaleTimeString(),
    );
    chart.data.datasets[0].data = sorted.map((item) => item.suhu);
    chart.data.datasets[1].data = sorted.map((item) => item.kelembapan);
    chart.update();

    // Render Tabel (10 data terbaru saja)
    const tableBody = document.getElementById("table-body");
    tableBody.innerHTML = history
      .slice(0, 10)
      .map(
        (item) => `
      <tr>
        <td>${item.id}</td>
        <td><span class="chip">${item.device_id}</span></td>
        <td class="${item.suhu > 35 ? "temp-hot" : ""}">${item.suhu}</td>
        <td>${item.kelembapan}</td>
        <td>${new Date(item.created_at + "Z").toLocaleString()}</td>
      </tr>
    `,
      )
      .join("");
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
  }
}

// Inisialisasi & polling 5 detik
initChart();
updateDashboard();
setInterval(updateDashboard, 5000);
