// -*- mode: swift; swift-mode:basic-offset: 2; -*-
// Copyright © 2022 Massachusetts Institute of Technology. All rights reserved.

import Foundation
import GTMSessionFetcher
import GoogleAPIClientForREST

@objc class Spreadsheet : NonvisibleComponent {

  private let _workQueue = DispatchQueue(label: "Spreadsheet", qos: .userInitiated)
  private var _service = GTLRSheetsService()
  private var _initialized = false
  private var _spreadsheetId = ""

  // MARK: Properties

  @objc var ApplicationName: String = ""
  @objc var CredentialsJson: String = "" {
    didSet {
      authorize()
    }
  }
  @objc var SpreadsheetID: String {
    get {
      return _spreadsheetId
    }
    set {
      if newValue.hasPrefix("https:") {
        let parts = newValue[newValue.index(newValue.startIndex, offsetBy: 8)...].split(separator: "/")
        _spreadsheetId = String(parts[3])
      } else {
        _spreadsheetId = newValue
      }
    }
  }

  // MARK: Methods

  @objc func Initialize() {
    _initialized = true
    authorize()
  }

  @objc func ReadSheet(_ sheetName: String) {
    guard !SpreadsheetID.isEmpty else {
      ErrorOccurred("ReadSheet: SpreadsheetID is empty.")
      return
    }

    _workQueue.async {
      self.retrieveSheet(sheetName, -1, nil, false, true)
    }
  }

  // MARK: Events

  @objc func ErrorOccurred(_ errorMessage: String) {
    DispatchQueue.main.async {
      EventDispatcher.dispatchEvent(of: self, called: "ErrorOccurred", arguments: errorMessage as AnyObject)
    }
  }

  @objc func GotSheetData(_ sheet: [[String]]) {
    DispatchQueue.main.async {
      EventDispatcher.dispatchEvent(of: self, called: "GotSheetData", arguments: sheet as AnyObject)
    }
  }

  // MARK: Private implementation

  func retrieveSheet(_ sheetName: String, _ colId: Int32, _ value: String?, _ exact: Bool, _ fireEvents: Bool) {
    let query = GTLRSheetsQuery_SpreadsheetsValuesGet.query(withSpreadsheetId: SpreadsheetID, range: sheetName)
    _service.executeQuery(query) { ticket, result, error in
      if let result = result as? GTLRSheets_ValueRange {
        if let values = result.values as? [[String]] {
          self.GotSheetData(values)
        }
      } else if let error = error {
        self.ErrorOccurred("\(error)")
      }
    }
  }

  // MARK: Private Implementation

  private func authorize() {
    guard _initialized else {
      return
    }
    guard !CredentialsJson.isEmpty else {
      _service.authorizer = nil
      return
    }
    do {
      let credentialsFile = AssetManager.shared.pathForExistingFileAsset(CredentialsJson)
      let credentials = try Data(contentsOf: URL(fileURLWithPath: credentialsFile))
      _service.authorizer = ServiceAccountAuthorizer(serviceAccountConfig: credentials, scopes: [
        kGTLRAuthScopeSheetsSpreadsheets,
      ])
    } catch {
      self.ErrorOccurred("\(error)")
      return
    }
  }
}
