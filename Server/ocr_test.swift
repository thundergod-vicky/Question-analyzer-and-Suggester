import Vision
import AppKit

func performOCR(imagePath: String) {
    guard let image = NSImage(contentsOfFile: imagePath),
          let tiffData = image.tiffRepresentation,
          let ciImage = CIImage(data: tiffData) else {
        print("Error: Could not load image")
        return
    }

    let handler = VNImageRequestHandler(ciImage: ciImage, options: [:])
    let request = VNRecognizeTextRequest { request, error in
        guard let observations = request.results as? [VNRecognizedTextObservation] else { return }
        let text = observations.compactMap { $0.topCandidates(1).first?.string }.joined(separator: "\n")
        print("EXTRACTED_TEXT_START")
        print(text)
        print("EXTRACTED_TEXT_END")
    }
    request.recognitionLevel = .accurate
    
    do {
        try handler.perform([request])
    } catch {
        print("Error: \(error)")
    }
}

let args = CommandLine.arguments
if args.count > 1 {
    performOCR(imagePath: args[1])
} else {
    print("Usage: ocr_test.swift <path_to_image>")
}
