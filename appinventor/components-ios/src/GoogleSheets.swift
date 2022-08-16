// -*- mode: swift; swift-mode:basic-offset: 2; -*-
// Copyright © 2022 Massachusetts Institute of Technology. All rights reserved.

import Foundation
import GTMSessionFetcher
import GoogleAPIClientForREST

@objc class GoogleSheets : NonvisibleComponent {

  private var _service = GTLRSheetsService()

  // MARK: Properties

  @objc var ApplicationName: String = ""
  @objc var CredentialsJson: String = ""
  @objc var SpreadsheetID: String = ""

  // MARK: Methods

  @objc func ReadSheet(_ sheetName: String) {
    guard !SpreadsheetID.isEmpty else {
      ErrorOccurred("ReadSheet: SpreadsheetID is empty.")
      return
    }

    retrieveSheet(sheetName, -1, nil, false, true)
  }

  // MARK: Events

  @objc func ErrorOccurred(_ errorMessage: String) {
    EventDispatcher.dispatchEvent(of: self, called: "ErrorOccurred", arguments: errorMessage as AnyObject)
  }

  @objc func GotSheet(_ sheet: [[String]]) {
    EventDispatcher.dispatchEvent(of: self, called: "GotSheet", arguments: sheet as AnyObject)
  }

  // MARK: Private implementation

  func retrieveSheet(_ sheetName: String, _ colId: Int32, _ value: String?, _ exact: Bool, _ fireEvents: Bool) {
    var query = GTLRSheetsQuery_SpreadsheetsValuesAppend.
    _service.executeQuery(GTLRQueryProtocol) { ticket, result, err in
      // code
    }
  }
}
