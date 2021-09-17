<?php
namespace Kubex\Fusion\Components\Blank;

use Packaged\SafeHtml\ISafeHtmlProducer;
use Packaged\SafeHtml\SafeHtml;

class Blank implements ISafeHtmlProducer
{
  public function produceSafeHTML(): SafeHtml
  {
    return new SafeHtml(
      sprintf('<fusion-blank></fusion-blank>')
    );
  }
}
