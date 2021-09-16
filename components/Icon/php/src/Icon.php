<?php
namespace Kubex\Fusion\Components\Icon;

use Packaged\SafeHtml\ISafeHtmlProducer;
use Packaged\SafeHtml\SafeHtml;

class Icon implements ISafeHtmlProducer
{
  protected $_src;
  protected $_library;
  protected $_size;

  public function __construct(string $src, Library $library = null)
  {
    $this->_src = $src;
    $this->_library = $library ?? Library::MaterialIconsOutlined();
    $this->_size = Size::Size24();
  }

  public function setSize(Size $size): self
  {
    $this->_size = $size;
    return $this;
  }

  public function size(): Size
  {
    return $this->_size;
  }

  public function produceSafeHTML(): SafeHtml
  {
    return new SafeHtml(
      sprintf('<fusion-icon src="%s" library="%s" size="%d"/>', $this->_src, $this->_library, $this->_size)
    );
  }

}
