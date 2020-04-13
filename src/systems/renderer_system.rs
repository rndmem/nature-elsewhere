use crate::components::{Bounds, MaxWH, Renderable, Text};
use crate::graphics::Renderer;
use crate::graphics::Viewport;
use crate::math::WH16;
use crate::resources::Timing;
use crate::sprites::Sprite;
use specs::prelude::{ResourceId, SystemData};
use specs::Join;
use specs::{ReadExpect, ReadStorage, System, World};
use std::cell::RefCell;
use std::rc::Rc;
use web_sys::console;

pub struct RendererSystem;

#[derive(SystemData)]
pub struct RenderData<'a> {
  timing: ReadExpect<'a, Timing>,
  renderer: ReadExpect<'a, Rc<RefCell<Renderer>>>,
  viewport: ReadExpect<'a, Viewport>,
  // bounds: ReadStorage<'a, Bounds>,
  // text: ReadStorage<'a, Text>,
  // max_wh: ReadStorage<'a, MaxWH>,
  sprites: ReadStorage<'a, Renderable<String>>,
}

impl<'a> System<'a> for RendererSystem {
  type SystemData = RenderData<'a>;

  fn run(&mut self, data: Self::SystemData) {
    let RenderData {
      timing,
      renderer,
      viewport,
      // bounds,
      // text,
      // max_wh,
      sprites,
    } = data;

    let bytes: Vec<u8> = (&sprites).join().fold(vec![], |mut bytes, sprite| {
      let mut more_bytes = bincode::config()
        .native_endian()
        .serialize(&sprite.sprites["Default"])
        .unwrap();
      // Drop the size in the header.
      for _ in 0..8 {
        more_bytes.remove(0);
      }
      bytes.append(&mut more_bytes);
      bytes
    });
    web_sys::console::log_1(&format!("{:?}", bytes).into());

    let mut renderer = renderer.borrow_mut();
    renderer.render(
      timing.play_time.as_secs_f32(),
      &viewport.canvas_wh,
      viewport.scale,
      &viewport.cam,
      &bytes,
    );

    // for (bounds, text, max_wh) in (&bounds, &text, (&max_wh).maybe()).join() {
    //   console::log_1(
    //     &format!(
    //       "Hello {:?} {} {} {:?}",
    //       &bounds,
    //       timing.delta,
    //       text.0,
    //       max_wh.unwrap_or(&MaxWH(WH16::from(255, 255))).0
    //     )
    //     .into(),
    //   );
    // }
  }
}