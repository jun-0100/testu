document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("usdm-root");
  const response = await fetch("usdm.json");
  const documentData = await response.json();

  const renderTable = (table) => {
    const wrapper = document.createElement("div");
    if (table.caption) {
      const cap = document.createElement("div");
      cap.className = "table-caption";
      cap.textContent = table.caption;
      wrapper.appendChild(cap);
    }

    const t = document.createElement("table");
    t.className = "usdm-table";

    if (table.header) {
      const thead = document.createElement("thead");
      const row = document.createElement("tr");
      table.header.forEach((cell) => {
        const th = document.createElement("th");
        th.textContent = cell;
        row.appendChild(th);
      });
      thead.appendChild(row);
      t.appendChild(thead);
    }

    if (table.rows) {
      const tbody = document.createElement("tbody");
      table.rows.forEach((rowData) => {
        const tr = document.createElement("tr");
        rowData.forEach((cell) => {
          const td = document.createElement("td");
          td.textContent = cell;
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      t.appendChild(tbody);
    }

    wrapper.appendChild(t);
    return wrapper;
  };

  const renderBody = (body) => {
    const div = document.createElement("div");

    if (body.text) {
      const p = document.createElement("p");
      p.textContent = body.text;
      div.appendChild(p);
    }

    if (body.figures) {
      body.figures.forEach((fig) => {
        if (fig.type === "mermaid") {
          const pre = document.createElement("pre");
          pre.className = "mermaid";
          pre.textContent = fig.src;
          div.appendChild(pre);
        }
      });
    }

    if (body.tables) {
      body.tables.forEach((tbl) => {
        div.appendChild(renderTable(tbl));
      });
    }

    return div;
  };

  const renderRequirement = (req, prefix = "") => {
    const wrapper = document.createElement("div");
    wrapper.className = "requirement";
    const idText = `${prefix}${String(req.id_number).padStart(2, "0")}`;

    const h = document.createElement("h3");
    h.innerHTML = `<span class="req-id">${idText}</span> ${req.body.text}`;
    wrapper.appendChild(h);

    if (req.reason) {
      const r = document.createElement("div");
      r.className = "reason";
      r.innerHTML = `<strong>理由:</strong> ${req.reason}`;
      wrapper.appendChild(r);
    }

    if (req.description) {
      const d = document.createElement("div");
      d.className = "description";
      d.textContent = req.description;
      wrapper.appendChild(d);
    }

    wrapper.appendChild(renderBody(req.body));

    if (req.children) {
      req.children.forEach((child) => {
        wrapper.appendChild(renderRequirement(child, `${idText}.`));
      });
    }

    if (req.specifications) {
      const list = document.createElement("ul");
      req.specifications.forEach((spec) => {
        const li = document.createElement("li");
        const fullID = `${idText}.${String(spec.id_number).padStart(2, "0")}`;
        li.innerHTML = `<strong>${fullID}</strong>: ${spec.body.text}`;
        li.appendChild(renderBody(spec.body));
        list.appendChild(li);
      });
      wrapper.appendChild(list);
    }

    return wrapper;
  };

  documentData.categories.forEach((cat) => {
    const catDiv = document.createElement("div");
    catDiv.className = "category";
    const h2 = document.createElement("h2");
    h2.textContent = `カテゴリ: ${cat.id_name}`;
    catDiv.appendChild(h2);

    cat.requirements.forEach((req) => {
      catDiv.appendChild(renderRequirement(req, `${cat.id_name}.`));
    });

    container.appendChild(catDiv);
  });

  // Initialize Mermaid
  if (window.mermaid) {
    mermaid.initialize({ startOnLoad: true });
    mermaid.init();
  }
});
