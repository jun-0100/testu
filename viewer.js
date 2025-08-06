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

    //if (body.text) {
    //  const p = document.createElement("p");
    //  p.textContent = body.text;
    //  div.appendChild(p);
    //}

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

  const renderEntry = (fullID, body, reason, description, depth) => {
    const wrapper = document.createElement("div");
    wrapper.className = `usdm-entry depth-${depth}`;

    const idDiv = document.createElement("div");
    idDiv.className = "usdm-id";
    idDiv.textContent = fullID;

    const contentDiv = document.createElement("div");
    contentDiv.className = "usdm-content";

    const titleDiv = document.createElement("div");
    titleDiv.className = "usdm-title";
    titleDiv.textContent = body.text;
    contentDiv.appendChild(titleDiv);

    if (reason) {
      const reasonDiv = document.createElement("div");
      reasonDiv.className = "usdm-reason";
      reasonDiv.innerHTML = `<strong>理由:</strong> ${reason}`;
      contentDiv.appendChild(reasonDiv);
    }

    if (description) {
      const descDiv = document.createElement("div");
      descDiv.className = "usdm-description";
      descDiv.textContent = description;
      contentDiv.appendChild(descDiv);
    }

    contentDiv.appendChild(renderBody(body));
    wrapper.appendChild(idDiv);
    wrapper.appendChild(contentDiv);
    return wrapper;
  };

  const renderRequirement = (req, prefix = "", depth = 1) => {
    const fullID = `${prefix}${String(req.id_number).padStart(2, "0")}`;
    const wrapper = document.createElement("div");

    wrapper.appendChild(renderEntry(fullID, req.body, req.reason, req.description, depth));

    if (req.children) {
      req.children.forEach(child => {
        wrapper.appendChild(renderRequirement(child, `${fullID}.`, depth + 1));
      });
    }

    if (req.specifications) {
      req.specifications.forEach(spec => {
        const specID = `${fullID}.${String(spec.id_number).padStart(2, "0")}`;
        wrapper.appendChild(renderEntry(specID, spec.body, null, null, depth + 1));
      });
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

  if (window.mermaid) {
    mermaid.initialize({ startOnLoad: true });
    mermaid.init();
  }
});
