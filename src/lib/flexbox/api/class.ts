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
  OnDestroy,
  OnInit,
  Renderer,
  OnChanges,
  SimpleChanges,
  IterableDiffers,
  KeyValueDiffers
} from '@angular/core';
import {NgClass} from '@angular/common';

import {BaseFxDirectiveAdapter} from './base-adapter';
import {BreakPointRegistry} from './../../media-query/breakpoints/break-point-registry';
import {MediaChange} from '../../media-query/media-change';
import {MediaMonitor} from '../../media-query/media-monitor';

/** NgClass allowed inputs **/
export type NgClassType = string | string[] | Set<string> | {[klass: string]: any};

/**
 * Directive to add responsive support for ngClass.
 */
@Directive({
  selector: `
    [class.xs], [class.sm], [class.md], [class.lg], [class.xl], 
    [class.lt-sm], [class.lt-md], [class.lt-lg], [class.lt-xl],     
    [class.gt-xs], [class.gt-sm], [class.gt-md], [class.gt-lg],
        
    [ngClass.xs], [ngClass.sm], [ngClass.md], [ngClass.lg], [ngClass.xl],
    [ngClass.lt-sm], [ngClass.lt-md], [ngClass.lt-lg], [ngClass.lt-xl], 
    [ngClass.gt-xs], [ngClass.gt-sm], [ngClass.gt-md], [ngClass.gt-lg]  
  `
})
export class ClassDirective extends NgClass implements OnInit, OnChanges, OnDestroy {

  /* tslint:disable */
  @Input('ngClass.xs')    set ngClassXs(val: NgClassType) { this._base.cacheInput('classXs', val, true); }
  @Input('ngClass.sm')    set ngClassSm(val: NgClassType) {  this._base.cacheInput('classSm', val, true); };
  @Input('ngClass.md')    set ngClassMd(val: NgClassType) { this._base.cacheInput('classMd', val, true); };
  @Input('ngClass.lg')    set ngClassLg(val: NgClassType) { this._base.cacheInput('classLg', val, true);};
  @Input('ngClass.xl')    set ngClassXl(val: NgClassType) { this._base.cacheInput('classXl', val, true); };

  @Input('ngClass.lt-xs') set ngClassLtXs(val: NgClassType) { this._base.cacheInput('classLtXs', val, true); };
  @Input('ngClass.lt-sm') set ngClassLtSm(val: NgClassType) { this._base.cacheInput('classLtSm', val, true);} ;
  @Input('ngClass.lt-md') set ngClassLtMd(val: NgClassType) { this._base.cacheInput('classLtMd', val, true);};
  @Input('ngClass.lt-lg') set ngClassLtLg(val: NgClassType) { this._base.cacheInput('classLtLg', val, true); };

  @Input('ngClass.gt-xs') set ngClassGtXs(val: NgClassType) { this._base.cacheInput('classGtXs', val, true); };
  @Input('ngClass.gt-sm') set ngClassGtSm(val: NgClassType) { this._base.cacheInput('classGtSm', val, true);} ;
  @Input('ngClass.gt-md') set ngClassGtMd(val: NgClassType) { this._base.cacheInput('classGtMd', val, true);};
  @Input('ngClass.gt-lg') set ngClassGtLg(val: NgClassType) { this._base.cacheInput('classGtLg', val, true); };

  @Input('ngClass.handset')           set handset(val)           { this._base.cacheInput('classHandset', val); };
  @Input('ngClass.handset.landscape') set handsetLandscape(val)  { this._base.cacheInput('classHandsetLandscape', val) };
  @Input('ngClass.handset.portrait')  set handsetPortrait(val)   { this._base.cacheInput('classHandsetPortrait', val); };
  @Input('ngClass.tablet')            set tablet(val)            { this._base.cacheInput('classTablet', val); };
  @Input('ngClass.tablet.landscape')  set tabletLandscape(val)   { this._base.cacheInput('classTabletLandscape', val); };
  @Input('ngClass.tablet.portrait')   set tabletPortrait(val)    { this._base.cacheInput('classTabletPortrait', val); };
  @Input('ngClass.web')               set web(val)               { this._base.cacheInput('classWeb', val); };
  @Input('ngClass.web.landscape')     set webLandscape(val)      { this._base.cacheInput('classWebLandscape', val); };
  @Input('ngClass.web.portrait')      set webPortrait(val)       { this._base.cacheInput('classWebPortrait', val); };

  /** Deprecated selectors */
  @Input('class.xs')      set classXs(val: NgClassType) { this._base.cacheInput('classXs', val, true); }
  @Input('class.sm')      set classSm(val: NgClassType) {  this._base.cacheInput('classSm', val, true); };
  @Input('class.md')      set classMd(val: NgClassType) { this._base.cacheInput('classMd', val, true);};
  @Input('class.lg')      set classLg(val: NgClassType) { this._base.cacheInput('classLg', val, true); };
  @Input('class.xl')      set classXl(val: NgClassType) { this._base.cacheInput('classXl', val, true); };

  @Input('class.lt-xs')   set classLtXs(val: NgClassType) { this._base.cacheInput('classLtXs', val, true); };
  @Input('class.lt-sm')   set classLtSm(val: NgClassType) { this._base.cacheInput('classLtSm', val, true); };
  @Input('class.lt-md')   set classLtMd(val: NgClassType) { this._base.cacheInput('classLtMd', val, true);};
  @Input('class.lt-lg')   set classLtLg(val: NgClassType) { this._base.cacheInput('classLtLg', val, true); };

  @Input('class.gt-xs')   set classGtXs(val: NgClassType) { this._base.cacheInput('classGtXs', val, true); };
  @Input('class.gt-sm')   set classGtSm(val: NgClassType) { this._base.cacheInput('classGtSm', val, true); };
  @Input('class.gt-md')   set classGtMd(val: NgClassType) { this._base.cacheInput('classGtMd', val, true);};
  @Input('class.gt-lg')   set classGtLg(val: NgClassType) { this._base.cacheInput('classGtLg', val, true); };

  /* tslint:enable */
  constructor(protected monitor: MediaMonitor,
              protected _bpRegistry: BreakPointRegistry,
              _iterableDiffers: IterableDiffers, _keyValueDiffers: KeyValueDiffers,
              _ngEl: ElementRef, _renderer: Renderer) {
    super(_iterableDiffers, _keyValueDiffers, _ngEl, _renderer);
    this._base = new BaseFxDirectiveAdapter(monitor, _ngEl, _renderer);
  }

  /**
   * For @Input changes on the current mq activation property, see onMediaQueryChanges()
   */
  ngOnChanges(changes: SimpleChanges) {
    const changed = this._bpRegistry.items.some(it => {
      return (`ngClass${it.suffix}` in changes) || (`class${it.suffix}` in changes);
    });
    if (changed || this._base.mqActivation) {
      this._updateStyle();
    }
  }

  /**
   * After the initial onChanges, build an mqActivation object that bridges
   * mql change events to onMediaQueryChange handlers
   */
  ngOnInit() {
    this._base.listenForMediaQueryChanges('class', '', (changes: MediaChange) => {
      this._updateStyle(changes.value);
    });
    this._updateStyle();
  }

  ngOnDestroy() {
    this._base.ngOnDestroy();
  }

  protected _updateStyle(value?: NgClassType) {
    let clazz = value || this._base.queryInput("class") || '';
    if (this._base.mqActivation) {
      clazz = this._base.mqActivation.activatedInput;
    }
    // Delegate subsequent activity to the NgClass logic
    this.ngClass = clazz;
  }

  /**
   * Special adapter to cross-cut responsive behaviors
   * into the ClassDirective
   */
  protected _base: BaseFxDirectiveAdapter;
}

