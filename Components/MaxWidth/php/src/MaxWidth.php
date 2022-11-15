<?php
namespace Kubex\Zinc\Components\MaxWidth;

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
      sprintf('<zn-max-width width="%d"></zn-max-width>', $this->_size)
    );
  }
}
