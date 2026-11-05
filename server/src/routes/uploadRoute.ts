import {Router} from 'express';
import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { ingestPdf } from '../ingestion';
import fs from 'node:fs/promises';
const uploadPDFRouter = Router();

const upload = multer({
    dest:"uploads/"
})

uploadPDFRouter.post("/", upload.single("pdf"), async (request, response) => {
   
   
    if(!request.file?.path){
        return response.status(400).json({
            message: "No PDF found"
        })
    }

    const filePath = request.file.path;

    const documentId = randomUUID();

    try{
        const nodes = await ingestPdf(filePath, documentId);

        const pageCount = nodes[0]?.metadata.total_pages ?? 0;
        
       return response.json({
        message: "PDF Uploaded and Read!",
        nodeCount: nodes.length,
        pageCount,
        documentId: documentId,

    })

    } catch(error){
        console.error(error)


        return response.status(500).json({
            message: "Uploading PDF failed."
        })
    }
    finally{

        try{
            await fs.unlink(filePath);

        }catch(cleanupError){
            console.error("Failed to delete temporary PDF:", cleanupError)
        }
    }
})


export default uploadPDFRouter;