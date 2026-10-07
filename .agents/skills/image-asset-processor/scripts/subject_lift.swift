import Foundation
import CoreImage
import Vision
import AppKit

let arguments = CommandLine.arguments
guard arguments.count >= 3 else {
    print("Usage: subject_lift <input> <output>")
    exit(1)
}

let inputURL = URL(fileURLWithPath: arguments[1])
let outputURL = URL(fileURLWithPath: arguments[2])

guard let inputImage = CIImage(contentsOf: inputURL) else {
    print("Failed to load input image")
    exit(1)
}

let request = VNGenerateForegroundInstanceMaskRequest()
let handler = VNImageRequestHandler(ciImage: inputImage, options: [:])

do {
    try handler.perform([request])
    guard let result = request.results?.first else {
        print("No foreground instance found")
        exit(1)
    }
    
    let maskPixelBuffer = try result.generateScaledMaskForImage(forInstances: result.allInstances, from: handler)
    let maskImage = CIImage(cvPixelBuffer: maskPixelBuffer)
    
    // Blend mask with original image
    let filter = CIFilter(name: "CIBlendWithMask")!
    filter.setValue(inputImage, forKey: kCIInputImageKey)
    filter.setValue(CIImage.empty(), forKey: kCIInputBackgroundImageKey)
    filter.setValue(maskImage, forKey: kCIInputMaskImageKey)
    
    guard let outputCIImage = filter.outputImage else {
        print("Failed to blend mask")
        exit(1)
    }
    
    let context = CIContext(options: nil)
    guard let cgImage = context.createCGImage(outputCIImage, from: outputCIImage.extent) else {
        print("Failed to create CGImage")
        exit(1)
    }
    
    let rep = NSBitmapImageRep(cgImage: cgImage)
    guard let pngData = rep.representation(using: .png, properties: [:]) else {
        print("Failed to generate PNG data")
        exit(1)
    }
    
    try pngData.write(to: outputURL)
    print("Success: saved to \(outputURL.path)")
} catch {
    print("Error: \(error)")
    exit(1)
}
