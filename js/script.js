function goTo(type) {
    localStorage.setItem("convertType", type);
    window.location.href = "convert.html";
}

window.onload = function() {
    const type = localStorage.getItem("convertType");
    const title = document.getElementById("title");

    if (title && type) {
        title.innerText = type.replace("-", " ").toUpperCase();
    }
};

async function convertFile() {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please upload a file");
        return;
    }

    const type = localStorage.getItem("convertType");

    if (type === "text-pdf") {
        const text = await file.text();
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.text(text, 10, 10);
        doc.save("converted.pdf");
    }

    if (type === "image-pdf") {
        const reader = new FileReader();
        reader.onload = function(e) {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.addImage(e.target.result, 'JPEG', 10, 10, 180, 160);
            doc.save("converted.pdf");
        };
        reader.readAsDataURL(file);
    }

    if (type === "image-ppt") {
        const reader = new FileReader();
        reader.onload = function(e) {
            let pptx = new PptxGenJS();
            let slide = pptx.addSlide();
            slide.addImage({ data: e.target.result, x: 1, y: 1, w: 5, h: 4 });
            pptx.writeFile("converted.pptx");
        };
        reader.readAsDataURL(file);
    }

    if (type === "text-ppt") {
        const text = await file.text();
        let pptx = new PptxGenJS();
        let slide = pptx.addSlide();
        slide.addText(text, { x: 1, y: 1, w: 6, h: 3 });
        pptx.writeFile("converted.pptx");
    }

    alert("File Converted Successfully!");
        }
