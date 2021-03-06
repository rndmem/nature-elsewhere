use num::traits::{cast::FromPrimitive, real::Real};

/// Returns the minimal integer multiple >= val.
pub fn ceil_multiple<T: Real>(val: T, multiple: T) -> T {
  if multiple.is_zero() {
    return multiple;
  }
  (val / multiple).ceil() * multiple
}

pub trait CeilMultiple {
  fn ceil_multiple(self, multiple: Self) -> Self;
}

pub trait TryCeilMultiple: Sized {
  fn try_ceil_multiple(self, multiple: Self) -> Option<Self>;
}

macro_rules! impl_CeilMultiple_float {
  ($($t:ty),+) => ($(
    impl CeilMultiple for $t {
      fn ceil_multiple(self, multiple: Self) -> Self {
        ceil_multiple(self, multiple)
      }
    }
  )+)
}
impl_CeilMultiple_float!(f32, f64);

macro_rules! impl_TryCeilMultiple_f32 {
  ($($t:ty),+) => ($(
    impl TryCeilMultiple for $t {
      fn try_ceil_multiple(self, multiple: Self) -> Option<Self> {
        Self::from_f32(ceil_multiple(self.into(), multiple.into()))
      }
    }
  )+)
}
impl_TryCeilMultiple_f32!(u8, u16, i8, i16);

macro_rules! impl_TryCeilMultiple_f64 {
  ($($t:ty),+) => ($(
    impl TryCeilMultiple for $t {
      fn try_ceil_multiple(self, multiple: Self) -> Option<Self> {
        Self::from_f64(ceil_multiple(self.into(), multiple.into()))
      }
    }
  )+)
}
impl_TryCeilMultiple_f64!(u32, i32);

#[cfg(test)]
mod test {
  use super::*;

  #[test]
  fn zero_multiple() {
    assert_eq!(0i16.try_ceil_multiple(0).unwrap(), 0);
    assert_eq!(0u32.try_ceil_multiple(0).unwrap(), 0);
    assert_eq!(0f64.ceil_multiple(0.), 0.);
  }

  #[test]
  fn zero_val() {
    assert_eq!(0i16.try_ceil_multiple(10).unwrap(), 0);
    assert_eq!(0u32.try_ceil_multiple(10).unwrap(), 0);
    assert_eq!(0f64.ceil_multiple(10.), 0.);
  }

  #[test]
  fn large_multiple() {
    assert_eq!(5i16.try_ceil_multiple(100).unwrap(), 100);
    assert_eq!(5u32.try_ceil_multiple(100).unwrap(), 100);
    assert_eq!(5f64.ceil_multiple(100.), 100.);
  }

  #[test]
  fn nonzero_nonmultiple() {
    assert_eq!(1i16.try_ceil_multiple(2).unwrap(), 2);
    assert_eq!(1u32.try_ceil_multiple(2).unwrap(), 2);
    assert_eq!(1f64.ceil_multiple(2.), 2.);
  }

  #[test]
  fn equal_multiple() {
    assert_eq!(3i16.try_ceil_multiple(3).unwrap(), 3);
    assert_eq!(3u32.try_ceil_multiple(3).unwrap(), 3);
    assert_eq!(3f64.ceil_multiple(3.), 3.);
  }

  #[test]
  fn nonequal_multiple() {
    assert_eq!(4i16.try_ceil_multiple(3).unwrap(), 6);
    assert_eq!(4u32.try_ceil_multiple(3).unwrap(), 6);
    assert_eq!(4f64.ceil_multiple(3.), 6.);
  }
}
