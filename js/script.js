function goTo(type) {
    localStorage.setItem("convertType", type);
    window.location.href = "convert.html";
}

document.addEventListener("DOMContentLoaded", function () {

    const area = document.getElementById("dynamicArea");
    if (!area) return;

    const type = localStorage.getItem("convertType");

    if (!type) {
        window.location.href = "index.html";
        return;
    }

    document.getElementById("title").innerText =
        type.replace("-", " ").toUpperCase();

    if (type === "text-pdf" || type === "text-ppt") {
        area.innerHTML =
            `<textarea id="textInput" placeholder="Enter your text here..."></textarea>`;
    }

    if (type === "image-pdf" || type === "image-ppt") {
        area.innerHTML =
            `<input type="file" id="fileInput" multiple accept="image/*">
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

    try {

        // TEXT → PDF
        if (type === "text-pdf") {

            const text = document.getElementById("textInput").value;
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            const lines = doc.splitTextToSize(text, 180);
            doc.text(lines, 10, 10);

            downloadBtn.onclick = () => doc.save("converted.pdf");
            downloadBtn.style.display = "block";
            status.innerText = "Ready to download!";
        }

        // IMAGE → PDF
        if (type === "image-pdf") {

            const files = document.getElementById("fileInput").files;
            if (!files.length) throw "Select images first";

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            for (let i = 0; i < files.length && i < 15; i++) {
                const imgData = await toBase64(files[i]);
                if (i !== 0) doc.addPage();
                doc.addImage(imgData, "JPEG", 10, 10, 180, 160);
            }

            downloadBtn.onclick = () => doc.save("images.pdf");
            downloadBtn.style.display = "block";
            status.innerText = "Ready to download!";
        }

        // IMAGE → PPT
        if (type === "image-ppt") {

            const files = document.getElementById("fileInput").files;
            if (!files.length) throw "Select images first";

            let pptx = new PptxGenJS();

            for (let i = 0; i < files.length && i < 15; i++) {
                const imgData = await toBase64(files[i]);
                let slide = pptx.addSlide();
                slide.addImage({
                    data: imgData,
                    x: 1,
                    y: 1,
                    w: 6,
                    h: 4
                });
            }

            downloadBtn.onclick = async () => {
                await pptx.writeFile("images.pptx");
            };

            downloadBtn.style.display = "block";
            status.innerText = "Ready to download!";
        }

        // TEXT → PPT
        if (type === "text-ppt") {

            const text = document.getElementById("textInput").value;
            if (!text.trim()) throw "Enter text first";

            let pptx = new PptxGenJS();

            const sections = text.split("#").filter(t => t.trim() !== "");

            sections.forEach(sec => {

                const lines = sec.trim().split("\n");

                let slide = pptx.addSlide();

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

            downloadBtn.onclick = async () => {
                await pptx.writeFile("presentation.pptx");
            };

            downloadBtn.style.display = "block";
            status.innerText = "Ready to download!";
        }

    } catch (err) {
        status.innerText = err;
    }
}

function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
