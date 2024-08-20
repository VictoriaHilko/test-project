import { observer } from 'mobx-react';
import { resolve } from 'inversify-react';
import classNames from 'classnames';

import { assertNever, mobxWhenever$ } from '~platform/core';
import { INLAutoplayStore } from '~platform/games/common/stores';

import { UI } from '~client/bootstrap/client-info';
import { t } from '~client/common/i18n';
import { DisposableComponent } from '~client/common/react-base';
import { TooltipsStore } from '~client/common/tooltip';
import { RegularTooltip, RegularTooltipPlacement } from '~client/common/tooltip/regular-tooltip.component';

import { MultitableAutoplayAutomationLocators, PanelViewState } from '../types';
import { MultitableAutoplayPanelStore } from '../multitable-autoplay-panel.store';
import { AutoplayButtonIcon } from './autoplay-button-icon.component';

import * as styles from './autoplay-button.md.scss';

@observer
export class AutoplayButton extends DisposableComponent {
  @resolve(INLAutoplayStore.$)
  declare private readonly _nlAutoplayStore: INLAutoplayStore;
  @resolve
  declare private readonly _multitableAutoplayPanelStore: MultitableAutoplayPanelStore;
  @resolve
  declare private readonly _tooltipStore: TooltipsStore;
  private readonly _tooltip = this.__.autoDispose(this['_tooltipStore'].createTooltip());

  override componentDidMount(): void {
    this.__.rxSubscribe(mobxWhenever$(
        () => this._nlAutoplayStore.hasBetForAutoplay),
        () => console.log('sfkjh'),
      () => this._tooltip.text && this._tooltip.hide()
    );
  }

  override render() {
    const isDisabled = !this._nlAutoplayStore.hasBetForAutoplay;
    const isAutoplayActive = this._multitableAutoplayPanelStore.panelViewState === PanelViewState.AutoplayInProgress;
    const autoplayRoundsLeft = isAutoplayActive ? this._multitableAutoplayPanelStore.autoplayRoundsLeft : 0;
    const tooltipHoverTextKey = isAutoplayActive ? 'mtbal-revamp-stop-autoplay-tooltip' : 'tooltip-autoplay';
    const locator = isAutoplayActive
      ? MultitableAutoplayAutomationLocators.AutoplayPromoteStop
      : MultitableAutoplayAutomationLocators.AutoplayPanelOpen;

    const buttonClasses = classNames(
      styles.autoplayButton,
      {
        [styles.autoplayButtonDisabled]: isDisabled,
        [styles.autoplayButtonOpenedPanel]: this._multitableAutoplayPanelStore.opened,
        [styles.autoplayButtonAutoplayActive]: isAutoplayActive,
      }
    );

    return (
      <RegularTooltip
        model={this._tooltip}
        additionalClasses={styles.autoplayButtonTooltip}
        onHoverText={UI.is.desktop ? t(tooltipHoverTextKey) : undefined}
        tooltipProps={{ placement: RegularTooltipPlacement.Bottom }}
      >
        <div
          className={buttonClasses}
          data-automation-locator={locator}
          onClick={this.handleClick}
        >
          <div className={styles.autoplayButtonIcon}>
            <AutoplayButtonIcon
              isPlaying={isAutoplayActive}
              isDisabled={isDisabled}
              color={this._multitableAutoplayPanelStore.opened ? '#f6ae38' : '#ffffff'}
            />
          </div>
          {autoplayRoundsLeft
            ? (
              <div className={styles.autoplayButtonRoundsCount}>
                {autoplayRoundsLeft}
              </div>
            )
            : null
          }
        </div>
      </RegularTooltip>
    );
  }

  private readonly handleClick = (): void => {
    const { panelViewState, open, promoteStop } = this._multitableAutoplayPanelStore;
    const { hasBetForAutoplay } = this._nlAutoplayStore;

    if (!hasBetForAutoplay) {
      this._tooltip.show('place-a-bet-first-for-autoplay');
    }

    switch (panelViewState) {
      case undefined:
        hasBetForAutoplay && open();
        break;
      case PanelViewState.AutoplayInProgress:
        promoteStop();
        break;
      case PanelViewState.AutoplayIdleStop:
      case PanelViewState.AutoplayPrepareStart:
        break;
      default:
        assertNever(panelViewState);
    }
  };
}
