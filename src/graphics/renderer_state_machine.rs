use super::renderer::Renderer;
use crate::assets::RendererAssets;
use crate::math::Millis;
use crate::wasm::FrameLooper;
use crate::wasm::{AddEventListener, EventListener};
use std::cell::RefCell;
use std::ops::DerefMut;
use std::rc::Rc;
use std::time::Duration;
use web_sys::{Document, Event, HtmlCanvasElement, VisibilityState, Window};

#[derive(Clone)]
pub struct RendererStateMachine {
  window: Window,
  document: Document,
  canvas: HtmlCanvasElement,
  assets: Rc<RendererAssets>,
  renderer: Rc<RefCell<Renderer>>,
  looper: Rc<RefCell<FrameLooper>>,
  listeners: Rc<RefCell<Vec<EventListener>>>,
  /// The last recorded render timestamp.
  last_rendered_at: Rc<RefCell<Option<Millis>>>,
  /// Total elapsed game time rendered. Excludes time spent paused.
  play_time: Rc<RefCell<Duration>>,
  on_loop_callback:
    Rc<RefCell<dyn FnMut(Rc<RefCell<Renderer>>, Duration, Millis)>>,
}

impl RendererStateMachine {
  pub fn new<T: 'static + FnMut(Rc<RefCell<Renderer>>, Duration, Millis)>(
    window: Window,
    document: Document,
    canvas: HtmlCanvasElement,
    assets: RendererAssets,
    on_loop: T,
  ) -> Self {
    let renderer = Rc::new(RefCell::new(Renderer::new(
      &assets.shader_layout,
      &assets.vertex_glsl,
      &assets.fragment_glsl,
      &assets.atlas_image,
      canvas.clone(),
    )));
    Self {
      window: window.clone(),
      document,
      assets: Rc::new(assets),
      canvas,
      renderer,
      last_rendered_at: Rc::new(RefCell::new(None)),
      looper: Rc::new(RefCell::new(FrameLooper::new(window))),
      listeners: Rc::new(RefCell::new(Vec::new())),
      play_time: Rc::new(RefCell::new(Duration::from_millis(0))),
      on_loop_callback: Rc::new(RefCell::new(on_loop)),
    }
  }

  pub fn start(&mut self) {
    if !self.listeners.borrow().is_empty() {
      return;
    }
    self.register();
    self.resume();
  }

  pub fn stop(&mut self) {
    if self.listeners.borrow().is_empty() {
      return;
    }
    self.pause();
    self.deregister();
  }

  fn resume(&mut self) {
    if self.renderer.borrow().is_context_lost() {
      return;
    }
    // Run one loop regardless of focus so that the game appears. A zero time
    // delta should mostly cause no updates but not everything is fully loop
    // independent like input sampling.
    let now = self.last_rendered_at.borrow().unwrap_or(0.);
    self.on_loop(now);

    if self.is_focused() {
      // Starting a new loop cycle. Clear the last rendered time so that the
      // initial delta is zero.
      *self.last_rendered_at.borrow_mut() = None;

      let rc = Rc::new(RefCell::new(self.clone()));
      self.looper.borrow_mut().start(move |time| rc.borrow_mut().on_loop(time));
    }
  }

  fn is_focused(&self) -> bool {
    self.document.has_focus().unwrap_or(false)
  }

  fn pause(&mut self) {
    self.looper.borrow_mut().stop();
  }

  fn on_event(&mut self, event: Event) {
    if event.type_() == "webglcontextrestored" {
      let assets: &RendererAssets = std::borrow::Borrow::borrow(&self.assets);
      *self.renderer.borrow_mut() = Renderer::new(
        &assets.shader_layout,
        &assets.vertex_glsl,
        &assets.fragment_glsl,
        &assets.atlas_image,
        self.canvas.clone(),
      );
      self.resume();
    } else if event.type_() == "focus"
      || event.type_() == "visibilitychange"
        && self.document.visibility_state() == VisibilityState::Visible
      || event.type_() == "resize"
    {
      self.resume();
    } else {
      self.pause();
    }
    event.prevent_default();
  }

  fn on_loop(&mut self, now: f64) {
    let then = self.last_rendered_at.borrow().unwrap_or(now);
    *self.last_rendered_at.borrow_mut() = Some(now);
    let delta = now - then;
    let play_time =
      *self.play_time.borrow() + Duration::from_secs_f64(delta / 1000.);
    *self.play_time.borrow_mut() = play_time;
    self.on_loop_callback.borrow_mut().deref_mut()(
      self.renderer.clone(),
      play_time,
      delta,
    );
  }

  fn register(&mut self) {
    if !self.listeners.borrow().is_empty() {
      return;
    }

    let rc = Rc::new(RefCell::new(self.clone()));
    Self::add_win_on_event_listener(&rc, "focus");
    Self::add_win_on_event_listener(&rc, "visibilitychange");
    Self::add_win_on_event_listener(&rc, "blur");
    Self::add_win_on_event_listener(&rc, "resize");
    Self::add_canvas_on_event_listener(&rc, "webglcontextrestored");
    Self::add_canvas_on_event_listener(&rc, "webglcontextlost");
  }

  fn deregister(&mut self) {
    // EventListener.drop() will invoke EventTarget.remove_event_listener().
    self.listeners.borrow_mut().clear();
  }

  fn add_win_on_event_listener(rc: &Rc<RefCell<Self>>, event: &'static str) {
    let rc1 = rc.clone();
    rc.borrow().listeners.borrow_mut().push(
      rc.borrow().window.add_event_listener(event, move |event| {
        rc1.borrow_mut().on_event(event)
      }),
    );
  }

  fn add_canvas_on_event_listener(rc: &Rc<RefCell<Self>>, event: &'static str) {
    let rc1 = rc.clone();
    rc.borrow().listeners.borrow_mut().push(
      rc.borrow().canvas.add_event_listener(event, move |event| {
        rc1.borrow_mut().on_event(event)
      }),
    );
  }
}
