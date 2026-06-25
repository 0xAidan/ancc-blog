export const renderSparkline = (
  container: HTMLElement,
  values: number[],
  collecting: boolean,
): void => {
  container.replaceChildren();

  const width = 120;
  const height = 28;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));
  svg.setAttribute("aria-hidden", "true");
  svg.classList.add("sparkline");

  if (values.length < 2) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", "0");
    line.setAttribute("y1", String(height / 2));
    line.setAttribute("x2", String(width));
    line.setAttribute("y2", String(height / 2));
    line.setAttribute("class", "sparkline-placeholder");
    svg.appendChild(line);
    if (collecting) {
      const label = document.createElement("span");
      label.className = "sparkline-collecting";
      label.textContent = "Collecting…";
      container.appendChild(svg);
      container.appendChild(label);
      return;
    }
    container.appendChild(svg);
    return;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  polyline.setAttribute("points", points);
  polyline.setAttribute("fill", "none");
  polyline.setAttribute("stroke", "var(--accent)");
  polyline.setAttribute("stroke-width", "1.5");
  svg.appendChild(polyline);
  container.appendChild(svg);
};
