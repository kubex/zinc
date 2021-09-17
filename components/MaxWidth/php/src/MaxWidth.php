<?php
namespace Kubex\Fusion\Components\MaxWidth;

use Packaged\SafeHtml\ISafeHtmlProducer;
use Packaged\SafeHtml\SafeHtml;

class MaxWidth implements ISafeHtmlProducer
{

  /**
   * @var int
   */
  protected $_size;

  public function setSize(int $size): self
  {
    $this->_size = $size;
    return $this;
  }

  public function size(): int
  {
    return $this->_size;
  }

  public function produceSafeHTML(): SafeHtml
  {
    return new SafeHtml(
      sprintf('<fusion-max-width width="%d"></fusion-max-width>', $this->_size)
    );
  }
}
