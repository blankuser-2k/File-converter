function goTo(type) {
    localStorage.setItem("convertType", type);
    window.location.href = "convert.html";
}

document.addEventListener("DOMContentLoaded", function () {

    const area = document.getElementById("dynamicArea");
    if (!area) return;

    const type = localStorage.getItem("convertType");

    if (!type) {
        alert("Please choose conversion type first.");
        window.location.href = "index.html";
        return;
    }

    const title = document.getElementById("title");
    title.innerText = type.replace("-", " ").toUpperCase();

    if (type === "text-pdf" || type === "text-ppt") {
        area.innerHTML = `<textarea id="textInput" placeholder="Enter your text here..."></textarea>`;
    }

    if (type === "image-pdf" || type === "image-ppt") {
        area.innerHTML = `
            <input type="file" id="fileInput" multiple accept="image/*">
            <p>Select up to 15 images</p>`;
    }

    if (type === "compress") {
        area.innerHTML = `
            <input type="file" id="fileInput" accept="image/*">
            <select id="quality">
                <option value="0.8">80% Quality</option>
                <option value="0.6">60% Quality</option>
                <option value="0.4">40% Quality</option>
                <option value="0.25">25% Quality</option>
                <option value="0.1">10% Quality</option>
            </select>`;
    }
});

async function process() {

    const type = localStorage.getItem("convertType");
    const status = document.getElementById("status");
    const downloadBtn = document.getElementById("downloadBtn");

    status.innerText = "Processing...";
    downloadBtn.style.display = "none";

    if (type === "text-pdf") {
        const text = document.getElementById("textInput").value;
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const lines = doc.splitTextToSize(text, 180);
        doc.text(lines, 10, 10);

        downloadBtn.onclick = () => doc.save("converted.pdf");
        downloadBtn.style.display = "block";
    }

    if (type === "image-pdf") {
        const files = document.getElementById("fileInput").files;
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        for (let i = 0; i < files.length && i < 15; i++) {
            const imgData = await toBase64(files[i]);
            if (i !== 0) doc.addPage();
            doc.addImage(imgData, "JPEG", 10, 10, 180, 160);
        }

        downloadBtn.onclick = () => doc.save("images.pdf");
        downloadBtn.style.display = "block";
    }

    if (type === "image-ppt") {
        const files = document.getElementById("fileInput").files;
        let pptx = new PptxGenJS();

        for (let i = 0; i < files.length && i < 15; i++) {
            const imgData = await toBase64(files[i]);
            let slide = pptx.addSlide();
            slide.addImage({ data: imgData, x: 1, y: 1, w: 6, h: 4 });
        }

        downloadBtn.onclick = () => pptx.writeFile("images.pptx");
        downloadBtn.style.display = "block";
    }

    if (type === "text-ppt") {
        const text = document.getElementById("textInput").value;
        let pptx = new PptxGenJS();

        const sections = text.split("#").filter(t => t.trim() !== "");

        sections.forEach(sec => {
            let slide = pptx.addSlide();
            const lines = sec.trim().split("\n");

            slide.addText(lines[0], {
                x: 1,
                y: 1,
                w: 8,
                h: 1,
                fontSize: 28,
                bold: true,
                align: "center"
            });

            slide.addText(lines.slice(1).join("\n"), {
                x: 1,
                y: 2,
                w: 8,
                h: 3,
                fontSize: 18
            });
        });

        downloadBtn.onclick = () => pptx.writeFile("presentation.pptx");
        downloadBtn.style.display = "block";
    }

    if (type === "compress") {
        const file = document.getElementById("fileInput").files[0];
        const quality = parseFloat(document.getElementById("quality").value);

        const img = new Image();
        img.src = await toBase64(file);

        img.onload = function () {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);

            canvas.toBlob(function(blob) {

                const oldSize = (file.size / 1024).toFixed(2);
                const newSize = (blob.size / 1024).toFixed(2);

                status.innerText =
                    `Compressed from ${oldSize} KB to ${newSize} KB`;

                downloadBtn.onclick = () => {
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(blob);
                    link.download = "compressed.jpg";
                    link.click();
                };

                downloadBtn.style.display = "block";
            }, "image/jpeg", quality);
        };
    }

    status.innerText = "Ready to download!";
}

function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
            }
