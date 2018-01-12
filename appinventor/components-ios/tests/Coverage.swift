// -*- mode: swift; swift-mode:basic-offset: 2; -*-
// Copyright © 2018 Massachusetts Institute of Technology, All rights reserved.

import XCTest
@testable import AIComponentKit

class BlockData {
  var controls = [String:Bool]()
  var logic = [String:Bool]()
  var math = [String:Bool]()
  var text = [String:Bool]()
  var list = [String:Bool]()
  var dictionaries = [String:Bool]()
  var color = [String:Bool]()
  var variables = [String:Bool]()
  var procedures = [String:Bool]()
}

class ComponentData {
  var androidEventCount = 0
  var androidMethodCount = 0
  var androidPropertyCount = 0
  var iOSEventCount = 0
  var iOSMethodCount = 0
  var iOSPropertyCount = 0
  var events: Set<String> = []
  var propertyGetters: Set<String> = []
  var propertySetters: Set<String> = []
  var methods: Set<String> = []
}

class CoverageData {
  var blocks = BlockData()
  var components = Dictionary<String, ComponentData>()
}

func getMethodList(cls: AnyClass) -> Set<String> {
  var result = Set<String>()
  var mc: UInt32 = 0
  let mcPointer = withUnsafeMutablePointer(to: &mc, { $0 })
  let mlist = class_copyMethodList(cls, mcPointer)
  for i in 0...Int(mc) {
    let methodName = String(cString: sel_getName(method_getName(mlist![i])))
    if methodName.hasPrefix(".") {
      continue
    }
    let parts = methodName.split(":")
    result.insert(parts[0])
  }
  free(mlist)
  if (cls != NSObject.self) {
    // Recursively update the list of defined methods
    result = result.union(getMethodList(cls: class_getSuperclass(cls)!))
  }
  return result
}

func filter<E>(_ items: Set<E>, test: (E) -> Bool) -> Set<E> {
  var result = Set<E>()
  for item in items {
    if test(item) {
      result.insert(item)
    }
  }
  return result
}

func toJson(_ blocks: BlockData) -> Dictionary<String, Dictionary<String, Bool>> {
  return [
    "controls": blocks.controls,
    "logic": blocks.logic,
    "math": blocks.math,
    "text": blocks.text,
    "list": blocks.list,
    "dictionaries": blocks.dictionaries,
    "color": blocks.color,
    "variables": blocks.variables,
    "procedures": blocks.procedures
  ]
}

func toJson(_ component: ComponentData) -> Dictionary<String, Any> {
  return [
    "android": [
      "eventCount": component.androidEventCount,
      "methodCount": component.androidMethodCount,
      "propertyCount": component.androidPropertyCount
    ],
    "ios": [
      "eventCount": component.iOSEventCount,
      "methodCount": component.iOSMethodCount,
      "propertyCount": component.iOSPropertyCount
    ],
    "events": Array<String>(component.events),
    "methods": Array<String>(component.methods),
    "propertyGetters": Array<String>(component.propertyGetters),
    "propertySetters": Array<String>(component.propertySetters)
  ]
}

func toJson(_ coverage: CoverageData) -> Dictionary<String, Any> {
  return ["blocks": toJson(coverage.blocks), "components": coverage.components.mapValues({ (data) -> Dictionary<String, Any> in
    return toJson(data)
  })]
}

func writeJsonResults(_ coverage: CoverageData, to path: URL) {
  let data = toJson(coverage)
  if let os = OutputStream(url: path, append: false) {
    os.open()
    JSONSerialization.writeJSONObject(data, to: os, options: [JSONSerialization.WritingOptions.prettyPrinted], error: nil)
    os.close()
  } else {
    XCTFail("Unable to open stream for writing")
  }
}

class Coverage: XCTestCase {

  override class func setUp() {
    coverage = true
  }

  override class func tearDown() {
    coverage = false
  }

  func testCoverage() throws {
    let androidComponentData = try! loadAndroidComponentData()
    var iosComponentCoverage = [String: ComponentData]()
    var eventCount = 0
    var methodCount = 0
    var propertySetterCount = 0
    var propertyGetterCount = 0
    var iOSEventCount = 0
    var iOSMethodCount = 0
    var iOSPropertyGetterCount = 0
    var iOSPropertySetterCount = 0
    NSLog("Example: \(NSStringFromClass(Form.self))")
    for componentName in androidComponentData.keys {
      let coverage = ComponentData()
      let component = androidComponentData[componentName]!
      eventCount += (androidComponentData[componentName]?.events.count)!
      methodCount += (androidComponentData[componentName]?.methods.count)!
      propertySetterCount += (androidComponentData[componentName]?.propertySetters.count)!
      propertyGetterCount += (androidComponentData[componentName]?.propertyGetters.count)!
      let theClass: AnyClass? = NSClassFromString("AIComponentKit." + componentName)
      if let theClass = theClass {
        let methods = getMethodList(cls: theClass)
        coverage.events = component.events.intersection(methods)
        coverage.methods = component.methods.intersection(methods)
        coverage.propertyGetters = component.propertyGetters.intersection(methods)
        coverage.propertySetters = filter(component.propertySetters) { (method) -> Bool in
          return methods.contains("set" + method)
        }
        iOSEventCount += coverage.events.count
        iOSMethodCount += coverage.methods.count
        iOSPropertyGetterCount += coverage.propertyGetters.count
        iOSPropertySetterCount += coverage.propertySetters.count
      }
      coverage.androidEventCount = component.events.count
      coverage.iOSEventCount = coverage.events.count
      coverage.androidMethodCount = component.methods.count
      coverage.iOSMethodCount = coverage.methods.count
      coverage.androidPropertyCount = component.propertyGetters.union(component.propertySetters).count
      coverage.iOSPropertyCount = coverage.propertyGetters.union(coverage.propertySetters).count
      iosComponentCoverage[componentName] = coverage
    }
    NSLog("Event coverage: \(Float(iOSEventCount)/Float(eventCount))")
    NSLog("Method coverage: \(Float(iOSMethodCount)/Float(methodCount))")
    NSLog("Property (Get) coverage: \(Float(iOSPropertyGetterCount)/Float(propertyGetterCount))")
    NSLog("Property (Set) coverage: \(Float(iOSPropertySetterCount)/Float(propertySetterCount))")
    let coverageData = CoverageData()
    coverageData.blocks = try computeBlocksCoverage()
    coverageData.components = iosComponentCoverage
    let here = URL(fileURLWithPath: "\(#file)")
    let outputFile = URL(string: "../coverage.json", relativeTo: here)!
    writeJsonResults(coverageData, to: outputFile)
  }

  func computeBlocksCoverage() throws -> BlockData {
    let blocks = BuiltinBlockTests()
    try blocks.testControlBlocks()
    try blocks.testLogicBlocks()
    try blocks.testMathBlocks()
    try blocks.testTextBlocks()
    try blocks.testListBlocks()
    try blocks.testDictionaryBlocks()
    try blocks.testColorBlocks()
    try blocks.testVariableBlocks()
    try blocks.testProcedureBlocks()
    let results = BlockData()
    for (category, data) in coverageData {
      switch category {
      case "controls":
        results.controls = data
        break
      case "logic":
        results.logic = data
        break
      case "math":
        results.math = data
        break
      case "text":
        results.text = data
        break
      case "lists":
        results.list = data
        break
      case "dictionaries":
        results.dictionaries = data
        break
      case "color":
        results.color = data
        break
      case "variables":
        results.variables = data
        break
      case "procedures":
        results.procedures = data
        break
      default:
        print("Unknown category \(category)")
      }
    }
    return results
  }

  func loadAndroidComponentData() throws -> [String: ComponentData] {
    let jsonUrl = Bundle(for: Coverage.self).url(forResource: "simple_components", withExtension: "json")
    let data = try! JSONSerialization.jsonObject(with: Data(contentsOf: jsonUrl!))
    var result = [String: ComponentData]()
    if let data = data as? Array<Dictionary<String, Any>> {
      for description in data {
        let component = ComponentData()
        let properties = description["properties"] as! Array<Dictionary<String, Any>>
        let blockProperties = description["blockProperties"] as! Array<Dictionary<String, Any>>
        let methods = description["methods"] as! Array<Dictionary<String, Any>>
        let events = description["events"] as! Array<Dictionary<String, Any>>
        for property in properties {
          component.propertySetters.insert(property["name"] as! String)
        }
        for property in blockProperties {
          let name = property["name"] as! String
          switch property["rw"] as! String {
          case "read-write":
            component.propertySetters.insert(name)
            component.propertyGetters.insert(name)
            break
          case "read-only":
            component.propertyGetters.insert(name)
            break
          case "write-only":
            component.propertySetters.insert(name)
            break
          default:
            break
          }
        }
        for method in methods {
          component.methods.insert(method["name"] as! String)
        }
        for event in events {
          component.events.insert(event["name"] as! String)
        }
        result[description["name"] as! String] = component
      }
    }
    return result
  }
}
