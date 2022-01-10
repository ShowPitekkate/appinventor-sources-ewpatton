package com.google.appinventor.client.wizards.youngandroid;

import static com.google.appinventor.client.Ode.MESSAGES;

import com.google.appinventor.client.Ode;
import com.google.appinventor.client.explorer.project.Project;
import com.google.appinventor.client.explorer.youngandroid.ProjectToolbar;
import com.google.appinventor.client.wizards.NewProjectWizard;
import com.google.appinventor.client.wizards.TemplateUploadWizard;
import com.google.gwt.core.client.JavaScriptObject;
import com.google.gwt.dom.client.Document;
import com.google.gwt.dom.client.IFrameElement;
import com.google.gwt.dom.client.Style;
import com.google.gwt.user.client.Command;
import com.google.gwt.user.client.ui.HTMLPanel;

public final class NewYoungAndroidProjectWizard2 extends NewProjectWizard {

  private JavaScriptObject handler;

  public NewYoungAndroidProjectWizard2(ProjectToolbar toolbar) {
    super(MESSAGES.newYoungAndroidProjectWizardCaption());

    IFrameElement frame = Document.get().createIFrameElement();
    frame.setSrc("http://localhost:" + Ode.getSystemConfig().getAptlyPort()
        + "/");
    frame.getStyle().setWidth(800, Style.Unit.PX);
    frame.getStyle().setHeight(350, Style.Unit.PX);
    frame.getStyle().setBorderWidth(0, Style.Unit.PX);

    HTMLPanel panel = new HTMLPanel("");
    panel.getElement().appendChild(frame);
    addPage(panel);

    initFinishCommand(new Command() {
      @Override
      public void execute() {

      }
    });

    setupJavascript();
  }

  @Override
  public void show() {
    super.show();
    setPixelSize(800, 400);
    super.setPagePanelHeight(350);
    this.center();
  }

  @Override
  public void hide() {
    super.hide();
    unsetupJavascript();
  }

  private void loadProject(String url) {
    TemplateUploadWizard.openProjectFromTemplate(url, new NewProjectCommand() {
      @Override
      public void execute(Project project) {
        Ode.getInstance().openYoungAndroidProjectInDesigner(project);
        hide();
      }
    });
  }

  private native void setupJavascript()/*-{
    var self = this;
    var handler = function(e) {
      var msg = e.data;
      if (msg.open) {
        self.@com.google.appinventor.client.wizards.youngandroid.NewYoungAndroidProjectWizard2::loadProject(*)('http://localhost:5000' + msg.open);
      }
    }
    self.@com.google.appinventor.client.wizards.youngandroid.NewYoungAndroidProjectWizard2::handler = handler;
    $wnd.addEventListener('message', handler);
  }-*/;

  private native void unsetupJavascript()/*-{
    $wnd.removeEventListener('message', self.@com.google.appinventor.client.wizards.youngandroid.NewYoungAndroidProjectWizard2::handler);
  }-*/;
}
