// -*- mode: swift; swift-mode:basic-offset: 2; -*-
// Copyright 2023 MIT, All rights reserved
// Released under the Apache License, Version 2.0
// http://www.apache.org/licenses/LICENSE-2.0

import Foundation
import WebKit
import Zip

fileprivate let MODEL_PATH_SUFFIX = ".mdl"
fileprivate let TRANSFER_MODEL_PREFIX = "appinventor:personal-image-classifier/transfer/"
fileprivate let PERSONAL_MODEL_PREFIX = "appinventor:personal-image-classifier/personal/"

@objc open class PersonalImageClassifier : NonvisibleComponent, LifecycleDelegate, WKScriptMessageHandler, WKURLSchemeHandler {
  public static let MODE_VIDEO = "Video"
  public static let MODE_IMAGE = "Image"

  public static let ERROR_WEBVEWER_REQUIRED = -7

  private var _webview: WKWebView? = nil
  private var _inputMode = PersonalImageClassifier.MODE_VIDEO
  private var _labels = [String]()
  private var _modelPath = ""
  private var _running = false
  private var _minClassTime: Int32 = 0

  @objc public override init(_ container: ComponentContainer) {
    super.init(container)
  }

  // MARK: Properties

  @objc public var InputMode: String {
    get {
      return _inputMode
    }
    set {
      _inputMode = newValue
    }
  }

  @objc public var MinimumInterval: Int32 {
    get {
      return _minClassTime
    }
    set {
      _minClassTime = newValue
      if let webview = _webview {
        webview.evaluateJavaScript("minClassTime = \(newValue);")
      }
    }
  }

  // MARK: Methods

  @objc public func Initialize() {
    guard let webview = _webview else {
      _form?.dispatchErrorOccurredEvent(self, "WebViewer", ErrorMessage.ERROR_EXTENSION_ERROR, PersonalImageClassifier.ERROR_WEBVEWER_REQUIRED)
      return
    }
    do {
      webview.load(try URLRequest(url: "appinventor:personal_image_classifier.html", method: .get))
    } catch {
      print("\(error)")
    }
  }

  // MARK: Events

  @objc public func ClassifierReady() {
    DispatchQueue.main.async { [self] in
      InputMode = _inputMode
      MinimumInterval = _minClassTime
      EventDispatcher.dispatchEvent(of: self, called: "ClassifierReady")
    }
  }

  @objc public func GotClassification(_ result: YailDictionary) {
    DispatchQueue.main.async { [self] in
      EventDispatcher.dispatchEvent(of: self, called: "GotClassification", arguments: result)
    }
  }

  @objc public func Error(_ errorCode: Int32) {
    DispatchQueue.main.async {
      EventDispatcher.dispatchEvent(of: self, called: "Error", arguments: errorCode as AnyObject)
    }
  }

  // MARK: LifecycleDelegate

  @objc public func onPause() {
    if let webview = _webview, _inputMode == PersonalImageClassifier.MODE_VIDEO {
      webview.evaluateJavaScript("stopVideo();")
    }
  }

  @objc public func onResume() {
    if let webview = _webview, _inputMode == PersonalImageClassifier.MODE_VIDEO {
      webview.evaluateJavaScript("startVideo();")
    }
  }

  @objc public func onStop() {
    if let webview = _webview, _inputMode == PersonalImageClassifier.MODE_VIDEO {
      webview.evaluateJavaScript("stopVideo();")
    }
  }

  @objc public func onClear() {
    if let webview = _webview, _inputMode == PersonalImageClassifier.MODE_VIDEO {
      webview.evaluateJavaScript("stopVideo();")
    }
  }

  // MARK: WKScriptMessageHandler

  public func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
    guard let body = message.body as? [String:Any] else {
      return
    }
    let eventName = body["eventName"]
  }

  // MARK: WKURLSchemeHandler

  public func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
    guard let url = urlSchemeTask.request.url?.absoluteString else {
      return
    }
    guard let fileName = urlSchemeTask.request.url?.lastPathComponent else {
      urlSchemeTask.didFailWithError(PICError.FileNotFound)
      return
    }
    if url.hasPrefix(TRANSFER_MODEL_PREFIX) {

    } else if url.hasPrefix(PERSONAL_MODEL_PREFIX) {

    } else {
      urlSchemeTask.didFailWithError(PICError.FileNotFound)
    }
  }

  public func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {
    // We deliver the payload in one go so it cannot be cancelled.
  }

  // MARK: Private Implementation

  private func configureWebView(_ webview: WKWebView) {
    _webview = webview
    webview.configuration.preferences.javaScriptEnabled = true
    webview.configuration.allowsInlineMediaPlayback = true
    webview.configuration.mediaTypesRequiringUserActionForPlayback = []
    webview.configuration.userContentController.add(self, name: "PersonalImageClassifier")
    webview.configuration.setURLSchemeHandler(self, forURLScheme: "appinventor")
  }
}

enum PICError: Error {
  case FileNotFound
}

