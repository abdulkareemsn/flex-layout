/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Renderer,
  SimpleChanges, Self, Optional,
} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {extendObject} from '../../utils/object-extend';

import {BaseFxDirective} from './base';
import {MediaChange} from '../../media-query/media-change';
import {MediaMonitor} from '../../media-query/media-monitor';
import {LayoutDirective, LAYOUT_VALUES} from './layout';

/**
 * @deprecated
 * This functionality is now part of the `fxLayout` API
 *
 * 'layout-wrap' flexbox styling directive
 * Defines wrapping of child elements in layout container
 * Optional values: reverse, wrap-reverse, none, nowrap, wrap (default)]
 *
 *
 * @see https://css-tricks.com/almanac/properties/f/flex-wrap/
 */
@Directive({selector: `
  [fxLayoutWrap], [fxLayoutWrap.xs], [fxLayoutWrap.sm], [fxLayoutWrap.lg], [fxLayoutWrap.xl],
  [fxLayoutWrap.gt-xs], [fxLayoutWrap.gt-sm], [fxLayoutWrap.gt-md], [fxLayoutWrap.gt-lg],
  [fxLayoutWrap.lt-xs], [fxLayoutWrap.lt-sm], [fxLayoutWrap.lt-md], [fxLayoutWrap.lt-lg]
`})
export class LayoutWrapDirective extends BaseFxDirective implements OnInit, OnChanges, OnDestroy {
  protected _layout = 'row';  // default flex-direction
  protected _layoutWatcher: Subscription;

  /* tslint:disable */
  @Input('fxLayoutWrap')       set wrap(val)     { this._cacheInput("wrap", val); }
  @Input('fxLayoutWrap.xs')    set wrapXs(val)   { this._cacheInput('wrapXs', val); }
  @Input('fxLayoutWrap.sm')    set wrapSm(val)   { this._cacheInput('wrapSm', val); };
  @Input('fxLayoutWrap.md')    set wrapMd(val)   { this._cacheInput('wrapMd', val); };
  @Input('fxLayoutWrap.lg')    set wrapLg(val)   { this._cacheInput('wrapLg', val); };
  @Input('fxLayoutWrap.xl')    set wrapXl(val)   { this._cacheInput('wrapXl', val); };

  @Input('fxLayoutWrap.gt-xs') set wrapGtXs(val) { this._cacheInput('wrapGtXs', val); };
  @Input('fxLayoutWrap.gt-sm') set wrapGtSm(val) { this._cacheInput('wrapGtSm', val); };
  @Input('fxLayoutWrap.gt-md') set wrapGtMd(val) { this._cacheInput('wrapGtMd', val); };
  @Input('fxLayoutWrap.gt-lg') set wrapGtLg(val) { this._cacheInput('wrapGtLg', val); };

  @Input('fxLayoutWrap.lt-sm') set wrapLtSm(val) { this._cacheInput('wrapLtSm', val); };
  @Input('fxLayoutWrap.lt-md') set wrapLtMd(val) { this._cacheInput('wrapLtMd', val); };
  @Input('fxLayoutWrap.lt-lg') set wrapLtLg(val) { this._cacheInput('wrapLtLg', val); };
  @Input('fxLayoutWrap.lt-xl') set wrapLtXl(val) { this._cacheInput('wrapLtXl', val); };

  @Input('fxLayoutWrap.handset')           set handset(val)           { this._cacheInput('wrapHandset', val); };
  @Input('fxLayoutWrap.handset.landscape') set handsetLandscape(val)  { this._cacheInput('wrapHandsetLandscape', val); };
  @Input('fxLayoutWrap.handset.portrait')  set handsetPortrait(val)   { this._cacheInput('wrapHandsetPortrait', val); };
  @Input('fxLayoutWrap.tablet')            set tablet(val)            { this._cacheInput('wrapTablet', val); };
  @Input('fxLayoutWrap.tablet.landscape')  set tabletLandscape(val)   { this._cacheInput('wrapTabletLandscape', val); };
  @Input('fxLayoutWrap.tablet.portrait')   set tabletPortrait(val)    { this._cacheInput('wrapTabletPortrait', val); };
  @Input('fxLayoutWrap.web')               set web(val)               { this._cacheInput('wrapWeb', val); };
  @Input('fxLayoutWrap.web.landscape')     set webLandscape(val)      { this._cacheInput('wrapWebLandscape', val); };
  @Input('fxLayoutWrap.web.portrait')      set webPortrait(val)       { this._cacheInput('wrapWebPortrait', val); };

  /* tslint:enable */
  constructor(
    monitor: MediaMonitor,
    elRef: ElementRef,
    renderer: Renderer,
    @Optional() @Self() container: LayoutDirective) {

    super(monitor, elRef, renderer);

    if (container) {  // Subscribe to layout direction changes
      this._layoutWatcher = container.layout$.subscribe(this._onLayoutChange.bind(this));
    }
  }

  // *********************************************
  // Lifecycle Methods
  // *********************************************

  ngOnChanges(changes: SimpleChanges) {
    if (changes['wrap'] != null || this._mqActivation) {
      this._updateWithValue();
    }
  }

  /**
   * After the initial onChanges, build an mqActivation object that bridges
   * mql change events to onMediaQueryChange handlers
   */
  ngOnInit() {
    this._listenForMediaQueryChanges('wrap', 'wrap', (changes: MediaChange) => {
      this._updateWithValue(changes.value);
    });
    this._updateWithValue();
  }


  // *********************************************
  // Protected methods
  // *********************************************

  /**
   * Cache the parent container 'flex-direction' and update the 'flex' styles
   */
  protected _onLayoutChange(direction) {
    this._layout = (direction || '').toLowerCase().replace('-reverse', '');
    if (!LAYOUT_VALUES.find(x => x === this._layout)) {
      this._layout = 'row';
    }

    this._updateWithValue();
  }

  protected _updateWithValue(value?: string) {
    value = value || this._queryInput("wrap") || 'wrap';
    if (this._mqActivation) {
      value = this._mqActivation.activatedInput;
    }
    value = this._validateValue(value);

    this._applyStyleToElement(this._buildCSS(value));
  }


  /**
   * Build the CSS that should be assigned to the element instance
   */
  protected _buildCSS(value) {
    return extendObject({ 'flex-wrap': value }, {
      'display' : 'flex',
      'flex-direction' : this._layout || 'row'
    });
  }

  /**
   * Convert layout-wrap="<value>" to expected flex-wrap style
   */
  protected _validateValue(value) {
    switch (value.toLowerCase()) {
      case 'reverse':
      case 'wrap-reverse':
        value = 'wrap-reverse';
        break;

      case 'no':
      case 'none':
      case 'nowrap':
        value = 'nowrap';
        break;

      // All other values fallback to "wrap"
      default:
        value = 'wrap';
        break;
    }
    return value;
  }
}
