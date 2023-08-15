//
//  ServiceAccountAuthorizer.swift
//  AIComponentKit
//
//  Created by Evan Patton on 8/13/23.
//  Copyright © 2023 Massachusetts Institute of Technology. All rights reserved.
//

import Foundation
import GTMSessionFetcher
import AuthLibrary

@available(iOS 13.0.0, *)
@objc class ServiceAccountAuthorizer : NSObject, GTMSessionFetcherAuthorizer {

  let tokenProvider: ServiceAccountTokenProvider
  var request: NSMutableURLRequest? = nil
  var canceled = false

  public init(serviceAccountConfig: Data) {
    super.init()
    self.tokenProvider = ServiceAccountTokenProvider(credentialsData: serviceAccountConfig, scopes: [])!
  }

  func authorizeRequest(_ request: NSMutableURLRequest?, completionHandler handler: @escaping (Error?) -> Void) {
    do {
      self.request = request
      self.canceled = false
      try tokenProvider.withToken { token, error in
        if let token = token, let accessToken = token.AccessToken, !self.canceled {
          request?.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        }
        self.request = nil
        handler(error)
      }
    } catch {
      self.request = nil
      handler(error)
    }
  }

  func authorizeRequest(_ request: NSMutableURLRequest?, delegate: Any, didFinish sel: Selector) {
    authorizeRequest(request) { error in
      (delegate as AnyObject).performSelector(onMainThread: sel, with: error, waitUntilDone: true)
    }
  }

  func stopAuthorization() {
    canceled = true
  }

  func stopAuthorization(for request: URLRequest) {
    canceled = true
  }

  func isAuthorizingRequest(_ request: URLRequest) -> Bool {
    return self.request == request as NSURLRequest
  }

  func isAuthorizedRequest(_ request: URLRequest) -> Bool {
    return false
  }

  var userEmail: String?
}
