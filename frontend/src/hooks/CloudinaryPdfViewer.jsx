

const CloudinaryPdfViewer = ({ pdfUrl, className, alt }) => {
  if (!pdfUrl) {
    return <img src="https://placehold.co/600x400/png" className={className} alt={alt || "Placeholder"} />;
  }
  
  // Check if it's a PDF and a Cloudinary URL
  const isPdf = pdfUrl.toLowerCase().endsWith('.pdf');
  const isCloudinary = pdfUrl.includes('cloudinary.com');
  
  if (!isPdf || !isCloudinary) {
    return <img src={pdfUrl} className={className} alt={alt || "Document"} />;
  }
  
  // Transform the Cloudinary URL to get the PDF as a JPG image
  const imageUrl = pdfUrl.replace('/upload/', '/upload/c_fill,f_jpg,pg_1,w_1000/');
  
  return <img src={imageUrl} className={className} alt={alt || "Invoice"} />;
};

export default CloudinaryPdfViewer;