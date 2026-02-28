const { jsPDF } = window.jspdf;

function showDownload(blob, filename){
    const btn = document.getElementById("downloadBtn");
    btn.style.display = "block";
    btn.onclick = function(){
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    };
}

/* IMAGE → PDF */
function imageToPDF(){
    const files = document.getElementById("imageInput").files;
    if(files.length === 0) return alert("Select images");

    const pdf = new jsPDF();
    let i = 0;
    const reader = new FileReader();

    reader.onload = function(e){
        const img = new Image();
        img.onload = function(){
            if(i > 0) pdf.addPage();
            pdf.addImage(img, 'JPEG', 10, 10, 180, 160);
            i++;
            if(i < files.length){
                reader.readAsDataURL(files[i]);
            }else{
                const blob = pdf.output("blob");
                showDownload(blob,"images.pdf");
                document.getElementById("status").innerText="Done!";
            }
        }
        img.src = e.target.result;
    };

    document.getElementById("status").innerText="Processing...";
    reader.readAsDataURL(files[0]);
}

/* TEXT → PDF */
function textToPDF(){
    const text = document.getElementById("textInput").value;
    if(!text) return alert("Enter text");

    const pdf = new jsPDF();
    pdf.text(text, 10, 10);
    const blob = pdf.output("blob");
    showDownload(blob,"text.pdf");
    document.getElementById("status").innerText="Done!";
}

/* IMAGE → PPT */
function imageToPPT(){
    const files = document.getElementById("imageInput").files;
    if(files.length === 0) return alert("Select images");

    document.getElementById("status").innerText="Processing...";

    let ppt = new PptxGenJS();
    let i = 0;
    const reader = new FileReader();

    reader.onload = function(e){
        let slide = ppt.addSlide();
        slide.addImage({data:e.target.result,x:1,y:1,w:8,h:4});
        i++;
        if(i < files.length){
            reader.readAsDataURL(files[i]);
        }else{
            ppt.write("blob").then(blob=>{
                showDownload(blob,"images.pptx");
                document.getElementById("status").innerText="Done!";
            });
        }
    };

    reader.readAsDataURL(files[0]);
}

/* TEXT → PPT */
function textToPPT(){
    const text = document.getElementById("textInput").value;
    if(!text) return alert("Enter text");

    document.getElementById("status").innerText="Processing...";

    let ppt = new PptxGenJS();
    let slide = ppt.addSlide();
    slide.addText(text,{x:1,y:1,w:8,h:5,fontSize:18});

    ppt.write("blob").then(blob=>{
        showDownload(blob,"text.pptx");
        document.getElementById("status").innerText="Done!";
    });
}

/* PDF Compressor */
function compressPDF(){
    const file = document.getElementById("pdfFile").files[0];
    if(!file) return alert("Upload PDF");

    document.getElementById("status").innerText="Processing...";

    const reader = new FileReader();
    reader.onload = function(e){
        const blob = new Blob([e.target.result],{type:"application/pdf"});
        showDownload(blob,"compressed.pdf");
        document.getElementById("status").innerText="Done!";
    };
    reader.readAsArrayBuffer(file);
}

/* PPT Compressor */
function compressPPT(){
    const file = document.getElementById("pptFile").files[0];
    if(!file) return alert("Upload PPT");

    document.getElementById("status").innerText="Processing...";

    const reader = new FileReader();
    reader.onload = function(e){
        const blob = new Blob([e.target.result],{
            type:"application/vnd.openxmlformats-officedocument.presentationml.presentation"
        });
        showDownload(blob,"compressed.pptx");
        document.getElementById("status").innerText="Done!";
    };
    reader.readAsArrayBuffer(file);
        }
