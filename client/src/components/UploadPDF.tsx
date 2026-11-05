import type { FormEvent } from "react"

type UploadFormProps = {
    selectedFile: File | null
    uploadedMessage: string
    pageCount: number | null
    isUploading: boolean
    setSelectedFile: (file: File | null) => void
    uploadPdf: (event: FormEvent) => Promise<void>
    uploadError: string | null
}

function UploadPDF({selectedFile, isUploading, setSelectedFile, uploadPdf, uploadedMessage, pageCount, uploadError}: UploadFormProps ){

    return (
        <section>
            <h2>Document</h2>
            <form className="row" onSubmit={uploadPdf}>
            <input 

            type="file"
            accept="application/pdf"
            disabled={isUploading}
            onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setSelectedFile(file);
            }}
            
            ></input>

            <button type="submit" disabled={isUploading || !selectedFile}> {isUploading ? "Loading..." : "Upload a PDF"} </button>
            </form>

            {uploadedMessage && <p className="note">{uploadedMessage}</p>}
            {pageCount!== null && <p className="note">{pageCount} pages</p>}
            {uploadError !==null && <p className="error">{uploadError}</p>}


        </section>
    )

}

export default UploadPDF;