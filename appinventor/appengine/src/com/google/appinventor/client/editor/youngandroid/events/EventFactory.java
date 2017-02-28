package com.google.appinventor.client.editor.youngandroid.events;

import com.google.appinventor.client.DesignToolbar;
import com.google.appinventor.client.Ode;
import com.google.appinventor.client.editor.simple.components.MockComponent;
import com.google.appinventor.client.editor.simple.components.MockContainer;
import com.google.appinventor.client.editor.simple.palette.SimpleComponentDescriptor;
import com.google.appinventor.client.editor.youngandroid.YaFormEditor;
import com.google.appinventor.client.editor.youngandroid.YaProjectEditor;
import com.google.appinventor.client.output.OdeLog;
import com.google.gwt.core.client.JavaScriptObject;

public class EventFactory {

  static final String COMPONENT_CREATE = "component.create";
  static final String COMPONENT_DELETE = "component.delete";
  static final String COMPONENT_PROPERTY = "component.property";

/*  private interface EventFactorySources extends JsniBundle {
    @LibrarySource("events.js")
    public void load();
  }
  
  static {
    ((EventFactorySources) GWT.create(EventFactorySources.class)).load();
  }*/


  private static void runCreateComponent(CreateComponent event) {
//    long projectId = Long.parseLong(event.getProjectId());
//    DesignToolbar.DesignProject currentProject = Ode.getInstance().getDesignToolbar().getCurrentProject();
//    if (projectId != currentProject.projectId) {
//      return;
//    }
//    YaProjectEditor projectEditor = (YaProjectEditor) Ode.getInstance().getEditorManager().getOpenProjectEditor(currentProject.projectId);
//    YaFormEditor formEditor = projectEditor.getFormFileEditor(currentProject.currentScreen);
//    MockComponent component = null;
//    if(formEditor.hasComponent(event.getComponentId())){
//      component = formEditor.getComponent(event.getComponentId());
//    }else {
//      component = SimpleComponentDescriptor.createMockComponent(event.getComponentType(), formEditor);
//      component.onCreateFromPalette();
//      component.changeProperty(MockComponent.PROPERTY_NAME_UUID, event.getComponentId());
//    }
//    OdeLog.log("run create component " + event.getComponentType());
//    if (component.isVisibleComponent()) {
//      OdeLog.log("component is visible");
//      MockContainer container = (MockContainer) formEditor.getComponent(event.getParentId());
//      container.addVisibleComponent(component, event.getBeforeIndex());
//    } else {
//      OdeLog.log("component is non-visible");
//      formEditor.getForm().addComponent(component);
//      formEditor.getNonVisibleComponentsPanel().addComponent(component);
//      component.select();
//    }
  }

  private static void runDeleteComponent(DeleteComponent event) {
//    long projectId = Long.parseLong(event.getProjectId());
//    DesignToolbar.DesignProject currentProject = Ode.getInstance().getDesignToolbar().getCurrentProject();
//    if (projectId != currentProject.projectId) {
//      return;
//    }
//
//    YaProjectEditor projectEditor = (YaProjectEditor) Ode.getInstance().getEditorManager().getOpenProjectEditor(currentProject.projectId);
//    YaFormEditor formEditor = projectEditor.getFormFileEditor(currentProject.currentScreen);
//    MockComponent component = formEditor.getComponent(event.getComponentId());
//    MockContainer container = (MockContainer) formEditor.getComponent(event.getParentId());
//    container.removeComponent(component, event.getDeleted());
  }

  private static void runChangeProperty(ChangeProperty event) {
    long projectId = Long.parseLong(event.getProjectId());
    DesignToolbar.DesignProject currentProject = Ode.getInstance().getDesignToolbar().getCurrentProject();
    if (projectId != currentProject.projectId) {
      return;
    }

    YaProjectEditor projectEditor = (YaProjectEditor) Ode.getInstance().getEditorManager().getOpenProjectEditor(currentProject.projectId);
    YaFormEditor formEditor = projectEditor.getFormFileEditor(currentProject.currentScreen);
    MockComponent component = formEditor.getComponent(event.getComponentId());
    String oldName = component.getName();
    component.changeProperty(event.getProperty(), event.getValue());
    if (event.getProperty().equals(MockComponent.PROPERTY_NAME_NAME)) {
      formEditor.getForm().fireComponentRenamed(component, oldName);
    } else {
      formEditor.getForm().fireComponentPropertyChanged(component, event.getProperty(), event.getValue());
    }
  }
  /**
   * Run the component event
   * @param type the type of the component event
   * @param json json represents the component event
   */
  public static void run(String type, JavaScriptObject json) {
    if(type.equals(COMPONENT_CREATE)){
      CreateComponent event = CreateComponent.fromJson(json);
      runCreateComponent(event);
      return;
    }
    if (type.equals(COMPONENT_DELETE)) {
      DeleteComponent event = DeleteComponent.fromJson(json);
      runDeleteComponent(event);
      return;
    }
    if (type.equals(COMPONENT_PROPERTY)) {
      ChangeProperty event = ChangeProperty.fromJson(json);
      runChangeProperty(event);
      return;
    }
  }

  public static native void exportMethodToJavascript()/*-{
    console.log("event factory exported");
    $wnd.EventFactory_run =
      $entry(@com.google.appinventor.client.editor.youngandroid.events.EventFactory::run(Ljava/lang/String;Lcom/google/gwt/core/client/JavaScriptObject;));
  }-*/;
}
