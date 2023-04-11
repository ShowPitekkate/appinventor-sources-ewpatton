// -*- mode: swift; swift-mode:basic-offset: 2; -*-
// Copyright 2023 MIT, All rights reserved
// Released under the Apache License, Version 2.0
// http://www.apache.org/licenses/LICENSE-2.0

import Foundation

@objc open class TabArrangement: ViewComponent, ComponentContainer, AbstractMethodsForViewComponent, UITabBarControllerDelegate {
  private var _tabs = [Tab]()
  private var _controller = UITabBarController()

  override public init(_ parent: ComponentContainer) {
    super.init(parent)
    setDelegate(self)
  }

  // MARK: AbstractMethodsForViewComponent protocol implementation

  public override var view: UIView {
    return _controller.view
  }

  // MARK: ComponentContainer protocol implementation

  public func add(_ component: ViewComponent) {
    // TODO(ewpatton): Report an error
  }

  public func add(_ tab: Tab) {
    _tabs.append(tab)
    _controller.viewControllers?.append(tab)
  }

  public func setChildWidth(of component: ViewComponent, to width: Int32) {
    // Tab size is managed by the controller
  }

  public func setChildHeight(of component: ViewComponent, to height: Int32) {
    // Tab size is managed by the controller
  }

  public func isVisible(component: ViewComponent) -> Bool {
    return false
  }

  public func setVisible(component: ViewComponent, to visibility: Bool) {
    // Not needed
  }

  public func getChildren() -> [Component] {
    return _tabs as [Component]
  }

  public var container: ComponentContainer? {
    return _container
  }

  // MARK: UITabBarControllerDelegate protocol implementation

  // MARK: Properties

  @objc var SelectedTabIndicatorColor: Int32 {
    get {

    }
    set {

    }
  }

  @objc var TabBackgroundColor: Int32 {
    get {

    }
    set {

    }
  }

  @objc var TabTextColor: Int32 {
    get {

    }
    set {

    }
  }

  

  // MARK: Methods

  // MARK: Events

  @objc open func ShowTab(_ tab: Tab) {
    EventDispatcher.dispatchEvent(of: self, called: "ShowTab", arguments: tab as AnyObject)
  }

  // MARK: Private implementation

  func show(tab: Tab) {
    guard _controller.viewControllers?.contains(tab) == true else {
      return
    }
    _controller.selectedViewController = tab
  }
}
