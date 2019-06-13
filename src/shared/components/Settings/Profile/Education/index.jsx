/**
 * Child component of Settings/Profile/ renders the
 * 'Education' page.
 */
/* eslint-disable react/forbid-prop-types */
/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable no-undef */
import React from 'react';
import PT from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import ConsentComponent from 'components/Settings/ConsentComponent';
import { PrimaryButton } from 'topcoder-react-ui-kit';
import DatePicker from 'components/challenge-listing/Filters/DatePicker';
import ErrorMessage from 'components/Settings/ErrorMessage';
import ConfirmationModal from '../../CofirmationModal';
import EducationList from './List';

import './styles.scss';


export default class Education extends ConsentComponent {
  constructor(props) {
    super(props);
    this.onHandleDeleteEducation = this.onHandleDeleteEducation.bind(this);
    this.onDeleteEducation = this.onDeleteEducation.bind(this);
    this.onEditEducation = this.onEditEducation.bind(this);
    this.onUpdateSelect = this.onUpdateSelect.bind(this);
    this.loadEducationTrait = this.loadEducationTrait.bind(this);
    this.onUpdateInput = this.onUpdateInput.bind(this);
    this.onHandleAddEducation = this.onHandleAddEducation.bind(this);
    this.onAddEducation = this.onAddEducation.bind(this);
    this.loadPersonalizationTrait = this.loadPersonalizationTrait.bind(this);
    this.updatePredicate = this.updatePredicate.bind(this);
    this.onUpdateDate = this.onUpdateDate.bind(this);
    this.onCancelEditStatus = this.onCancelEditStatus.bind(this);

    const { userTraits } = props;
    this.state = {
      formInvalid: false,
      educationTrait: this.loadEducationTrait(userTraits),
      personalizationTrait: this.loadPersonalizationTrait(userTraits),
      newEducation: {
        schoolCollegeName: '',
        major: '',
        timePeriodFrom: '',
        timePeriodTo: '',
        graduated: false,
      },
      inputChanged: false,
      isMobileView: false,
      screenSM: 767,
      isEdit: false,
      indexNo: null,
      showConfirmation: false,
    };
  }

  componentDidMount() {
    this.updatePredicate();
    window.addEventListener('resize', this.updatePredicate);
  }

  componentWillReceiveProps(nextProps) {
    const educationTrait = this.loadEducationTrait(nextProps.userTraits);
    const personalizationTrait = this.loadPersonalizationTrait(nextProps.userTraits);
    this.setState({
      educationTrait,
      personalizationTrait,
      formInvalid: false,
      inputChanged: false,
      newEducation: {
        schoolCollegeName: '',
        major: '',
        timePeriodFrom: '',
        timePeriodTo: '',
        graduated: false,
      },
    });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updatePredicate);
  }

  /**
   * Check form fields value,
   * Invalid value, can not save
   * @param newEducation object
   */
  onCheckFormValue(newEducation) {
    let invalid = false;
    let haveDate = false;
    const currentDate = new Date().setHours(0, 0, 0, 0);

    if (!_.trim(newEducation.schoolCollegeName).length) {
      invalid = true;
    }


    if (!_.isEmpty(newEducation.timePeriodFrom) && !_.isEmpty(newEducation.timePeriodTo)) {
      const fromDate = new Date(newEducation.timePeriodFrom).setHours(0, 0, 0, 0);
      const toDate = new Date(newEducation.timePeriodTo).setHours(0, 0, 0, 0);

      if (fromDate > toDate) {
        haveDate = true;
      }

      if (fromDate > currentDate) {
        haveDate = true;
      }

      if ((toDate > currentDate) && newEducation.graduated) {
        haveDate = true;
      }
    }

    if (!haveDate
      && !(_.isEmpty(newEducation.timePeriodFrom) && _.isEmpty(newEducation.timePeriodTo))) {
      if (!_.trim(newEducation.timePeriodFrom).length) {
        invalid = true;
      }

      if (!_.trim(newEducation.timePeriodTo).length) {
        invalid = true;
      }
    }


    this.setState({ formInvalid: invalid });
    return invalid;
  }

  onCheckStartDate() {
    const { newEducation } = this.state;
    const currentDate = new Date().setHours(0, 0, 0, 0);
    const result = {
      invalid: false,
      message: '',
    };

    if (!_.isEmpty(newEducation.timePeriodFrom) && !_.isEmpty(newEducation.timePeriodTo)) {
      let fromDate = new Date(newEducation.timePeriodFrom);
      fromDate = fromDate.setHours(0, 0, 0, 0);
      let toDate = new Date(newEducation.timePeriodTo);
      toDate = toDate.setHours(0, 0, 0, 0);

      if (fromDate > toDate) {
        result.invalid = true;
        result.message = 'Start Date should be before End Date';
      }

      if (fromDate > currentDate) {
        result.invalid = true;
        result.message = result.message.length > 0 ? `${result.message} and in past or current` : 'Start Date should be in past or current';
      }
    }

    if (_.isEmpty(newEducation.timePeriodFrom) && !_.isEmpty(newEducation.timePeriodTo)) {
      result.invalid = true;
      result.message = 'Due to End Date has date, Start Date should be input';
    }

    return result;
  }

  onCheckEndDate() {
    const { newEducation } = this.state;
    const currentDate = new Date().setHours(0, 0, 0, 0);
    const result = {
      invalid: false,
      message: '',
    };

    if (!_.isEmpty(newEducation.timePeriodFrom) && !_.isEmpty(newEducation.timePeriodTo)) {
      const toDate = new Date(newEducation.timePeriodTo).setHours(0, 0, 0, 0);

      if ((toDate > currentDate) && newEducation.graduated) {
        result.invalid = true;
        result.message = 'End Date (or expected) should be in past or current';
      }
    }

    if (!_.isEmpty(newEducation.timePeriodFrom) && _.isEmpty(newEducation.timePeriodTo)) {
      result.invalid = true;
      result.message = 'Due to Start Date has date, End Date should be input';
    }

    return result;
  }

  onHandleDeleteEducation(indexNo) {
    this.setState({
      showConfirmation: true,
      indexNo,
    });
  }

  onUpdateDate(date, timePeriod) {
    if (date) {
      const { newEducation: oldEducation } = this.state;
      const newEducation = { ...oldEducation };
      newEducation[timePeriod] = date;
      this.setState({ newEducation, inputChanged: true });
    }
  }

  /**
   * Delete education by index
   * @param indexNo the education index no
   */
  onDeleteEducation(indexNo) {
    const { educationTrait } = this.state;
    const newEducationTrait = { ...educationTrait };
    newEducationTrait.traits.data.splice(indexNo, 1);
    this.setState({
      educationTrait: newEducationTrait,
    });

    const {
      handle,
      tokenV3,
      updateUserTrait,
      deleteUserTrait,
    } = this.props;

    if (newEducationTrait.traits.data.length > 0) {
      updateUserTrait(handle, 'education', newEducationTrait.traits.data, tokenV3);
    } else {
      deleteUserTrait(handle, 'education', tokenV3);
    }

    this.setState({
      showConfirmation: false,
      indexNo: null,
      inputChanged: false,
    });
  }

  /**
   * Edit Education by index
   * @param indexNo the education index no
   */
  onEditEducation(indexNo) {
    const { educationTrait } = this.state;
    this.setState({
      newEducation: {
        schoolCollegeName: educationTrait.traits.data[indexNo].schoolCollegeName,
        major: _.isEmpty(educationTrait.traits.data[indexNo].major) ? '' : educationTrait.traits.data[indexNo].major,
        timePeriodFrom: _.isEmpty(educationTrait.traits.data[indexNo].timePeriodFrom) ? '' : educationTrait.traits.data[indexNo].timePeriodFrom,
        timePeriodTo: _.isEmpty(educationTrait.traits.data[indexNo].timePeriodTo) ? '' : educationTrait.traits.data[indexNo].timePeriodTo,
        graduated: educationTrait.traits.data[indexNo].graduated,
      },
      isEdit: true,
      indexNo,
    });
  }

  /**
   * Add new education
   * @param answer user consent answer value
   */
  onAddEducation(answer) {
    const {
      newEducation, personalizationTrait, isEdit, indexNo,
    } = this.state;

    if (this.onCheckFormValue(newEducation)) {
      return;
    }

    const {
      handle,
      tokenV3,
      updateUserTrait,
      addUserTrait,
    } = this.props;

    const { educationTrait } = this.state;

    const education = _.clone(newEducation);
    if (_.isEmpty(education.major)) {
      delete education.major;
    }
    if (_.isEmpty(education.timePeriodFrom)) {
      delete education.timePeriodFrom;
    } else {
      education.timePeriodFrom = new Date(newEducation.timePeriodFrom).getTime();
    }
    if (_.isEmpty(education.timePeriodTo)) {
      delete education.timePeriodTo;
    } else {
      education.timePeriodTo = new Date(newEducation.timePeriodTo).getTime();
    }

    if (educationTrait.traits && educationTrait.traits.data.length > 0) {
      const newEducationTrait = { ...educationTrait };
      if (isEdit) {
        newEducationTrait.traits.data.splice(indexNo, 1);
      }
      newEducationTrait.traits.data.push(education);
      updateUserTrait(handle, 'education', newEducationTrait.traits.data, tokenV3);
    } else {
      const newEducations = [];
      newEducations.push(education);
      addUserTrait(handle, 'education', newEducations, tokenV3);
    }
    const empty = {
      schoolCollegeName: '',
      major: '',
      timePeriodFrom: '',
      timePeriodTo: '',
      graduated: false,
    };
    this.setState({
      newEducation: empty,
      isEdit: false,
      indexNo: null,
      inputChanged: false,
    });
    // save personalization
    if (_.isEmpty(personalizationTrait)) {
      const personalizationData = { userConsent: answer };
      addUserTrait(handle, 'personalization', [personalizationData], tokenV3);
    } else {
      const trait = personalizationTrait.traits.data[0];
      if (trait.userConsent !== answer) {
        const personalizationData = { userConsent: answer };
        updateUserTrait(handle, 'personalization', [personalizationData], tokenV3);
      }
    }
  }

  /**
   * Update input value
   * @param e event
   */
  onUpdateInput(e) {
    const { newEducation: oldEducation } = this.state;
    const newEducation = { ...oldEducation };
    if (e.target.type !== 'checkbox') {
      newEducation[e.target.name] = e.target.value;
    } else {
      newEducation[e.target.name] = e.target.checked;
      if (e.target.checked) {
        newEducation.timePeriodTo = '';
      }
    }

    this.setState({ newEducation, inputChanged: true });
  }

  /**
   * Update select value
   * @param option selected value
   */
  onUpdateSelect(option) {
    if (option) {
      const { newEducation: oldEducation } = this.state;
      const newEducation = { ...oldEducation };
      newEducation[option.key] = option.name;
      this.setState({ newEducation, inputChanged: true });
    }
  }

  /**
   * Show User Consent Modal
   * @param e event
   */
  onHandleAddEducation(e) {
    e.preventDefault();
    const { newEducation } = this.state;
    this.setState({ inputChanged: true });
    if (this.onCheckFormValue(newEducation)) {
      return;
    }
    this.showConsent(this.onAddEducation.bind(this));
  }

  /**
   * Get education trait
   * @param userTraits the all user traits
   */
  loadEducationTrait = (userTraits) => {
    const trait = userTraits.filter(t => t.traitId === 'education');
    const educations = trait.length === 0 ? {} : trait[0];
    return _.assign({}, educations);
  }

  /**
   * Get personalization trait
   * @param userTraits the all user traits
   */
  loadPersonalizationTrait = (userTraits) => {
    const trait = userTraits.filter(t => t.traitId === 'personalization');
    const personalization = trait.length === 0 ? {} : trait[0];
    return _.assign({}, personalization);
  }

  updatePredicate() {
    const { screenSM } = this.state;
    this.setState({ isMobileView: window.innerWidth <= screenSM });
  }

  onCancelEditStatus() {
    const { isEdit } = this.state;
    if (isEdit) {
      this.setState({
        isEdit: false,
        inputChanged: false,
        indexNo: null,
        newEducation: {
          schoolCollegeName: '',
          major: '',
          timePeriodFrom: '',
          timePeriodTo: '',
          graduated: false,
        },
      });
    }
  }

  render() {
    const {
      settingsUI,
    } = this.props;
    const {
      educationTrait,
      isMobileView,
      isEdit,
      showConfirmation,
      indexNo,
    } = this.state;
    const tabs = settingsUI.TABS.PROFILE;
    const currentTab = settingsUI.currentProfileTab;
    const containerStyle = currentTab === tabs.EDUCATION ? '' : 'hide';
    const educationItems = educationTrait.traits
      ? educationTrait.traits.data.slice() : [];
    const { newEducation, inputChanged } = this.state;


    return (
      <div styleName={containerStyle}>
        {
          this.shouldRenderConsent() && this.renderConsent()
        }
        {
          showConfirmation && (
            <ConfirmationModal
              onConfirm={() => this.showConsent(this.onDeleteEducation.bind(this, indexNo))}
              onCancel={() => this.setState({
                showConfirmation: false,
                indexNo: null,
              })}
              name={educationTrait.traits.data[indexNo].schoolCollegeName}
            />
          )
        }
        <div styleName="education-container">
          <h1>
            Education
          </h1>
          <div styleName={`sub-title ${educationItems.length > 0 ? '' : 'hidden'}`}>
            Your education
          </div>
          {
            !isMobileView && educationItems.length > 0
            && (
              <EducationList
                educationList={{ items: educationItems }}
                onDeleteItem={this.onHandleDeleteEducation}
                onEditItem={this.onEditEducation}
              />
            )
          }
          <div styleName={`sub-title ${educationItems.length > 0 ? 'second' : 'first'}`}>
            {
              isEdit ? (<React.Fragment>Edit education</React.Fragment>)
                : (<React.Fragment>Add a new education</React.Fragment>)
            }
          </div>
          <div styleName="form-container-default">
            <form name="device-form" noValidate autoComplete="off">
              <div styleName="row">
                <div styleName="field col-1">
                  <label htmlFor="name">
                    Name of College or University
                    <input type="hidden" />
                  </label>
                </div>
                <div styleName="field col-2">
                  <span styleName="text-required">* Required</span>
                  <input id="schoolCollegeName" name="schoolCollegeName" type="text" placeholder="Name" onChange={this.onUpdateInput} value={newEducation.schoolCollegeName} maxLength="64" required />
                  <ErrorMessage invalid={_.isEmpty(newEducation.schoolCollegeName) && inputChanged} message="Name cannot be empty" />
                </div>
              </div>
              <div styleName="row">
                <div styleName="field col-1-no-padding">
                  <label htmlFor="major">
                    Major
                    <input type="hidden" />
                  </label>
                </div>
                <div styleName="field col-2">
                  <input id="major" name="major" type="text" placeholder="Major" onChange={this.onUpdateInput} value={newEducation.major} maxLength="64" required />
                </div>
              </div>
              <div styleName="row">
                <div styleName="field col-1-no-padding">
                  <label htmlFor="timePeriodFrom">
                    Start Date
                    <input type="hidden" />
                  </label>
                </div>
                <div styleName="field col-2">
                  <DatePicker
                    readOnly
                    numberOfMonths={1}
                    isOutsideRange={moment()}
                    date={newEducation.timePeriodFrom}
                    id="date-from1"
                    onDateChange={date => this.onUpdateDate(date, 'timePeriodFrom')}
                    placeholder="dd/mm/yyyy"
                  />
                  <ErrorMessage
                    invalid={this.onCheckStartDate(newEducation).invalid && inputChanged}
                    message={this.onCheckStartDate(newEducation).message}
                  />
                </div>
              </div>
              <div styleName="row">
                <div styleName="field col-1-no-padding">
                  <label htmlFor="timePeriodTo">
                    End Date (or expected)
                    <input type="hidden" />
                  </label>
                </div>
                <div styleName="field col-2">
                  {
                    newEducation.graduated ? (
                      <DatePicker
                        readOnly
                        numberOfMonths={1}
                        isOutsideRange={moment()}
                        date={newEducation.timePeriodTo}
                        id="date-to1"
                        onDateChange={date => this.onUpdateDate(date, 'timePeriodTo')}
                        placeholder="dd/mm/yyyy"
                      />
                    ) : (
                      <DatePicker
                        readOnly
                        numberOfMonths={1}
                        date={newEducation.timePeriodTo}
                        id="date-to1"
                        onDateChange={date => this.onUpdateDate(date, 'timePeriodTo')}
                        placeholder="dd/mm/yyyy"
                        allowFutureYear
                      />
                    )
                  }
                  <ErrorMessage
                    invalid={this.onCheckEndDate(newEducation).invalid && inputChanged}
                    message={this.onCheckEndDate(newEducation).message}
                  />
                </div>
              </div>
              <div styleName="row">
                <div styleName="field col-1">
                  <label htmlFor="graduated">
                    Graduated
                    <input type="hidden" />
                  </label>
                </div>
                <div styleName="field col-2">
                  <div styleName="tc-checkbox">
                    <input
                      name="graduated"
                      checked={newEducation.graduated}
                      id="graduated"
                      onChange={this.onUpdateInput}
                      type="checkbox"
                    />
                    <label htmlFor="graduated">
                      <div styleName="tc-checkbox-label">
                        &nbsp;
                      </div>
                      <input type="hidden" />
                    </label>
                  </div>
                </div>
              </div>
            </form>
            <div styleName="button-container">
              <div styleName="button-save">
                <PrimaryButton
                  styleName="complete"
                  onClick={this.onHandleAddEducation}
                >
                  {
                    isEdit ? (<React.Fragment>Edit education to your list</React.Fragment>)
                      : (<React.Fragment>Add education to your list</React.Fragment>)
                  }
                </PrimaryButton>
              </div>
              {
                isEdit && (
                  <div styleName="button-cancel">
                    <PrimaryButton
                      styleName="complete"
                      onClick={this.onCancelEditStatus}
                    >
                      Cancel
                    </PrimaryButton>
                  </div>
                )
              }
            </div>
          </div>
          <div styleName="form-container-mobile">
            <form name="education-form" noValidate autoComplete="off">
              <div styleName="row">
                <p>
                  {
                    isEdit ? (<React.Fragment>Edit Education</React.Fragment>)
                      : (<React.Fragment>Add Education</React.Fragment>)
                  }
                </p>
              </div>
              <div styleName="row">
                <div styleName="field col-2">
                  <label htmlFor="schoolCollegeName">
                    Name of College or University
                    <span styleName="text-required">* Required</span>
                    <input type="hidden" />
                  </label>
                  <input id="schoolCollegeName" name="schoolCollegeName" type="text" placeholder="Name" onChange={this.onUpdateInput} value={newEducation.schoolCollegeName} maxLength="64" required />
                  <ErrorMessage invalid={_.isEmpty(newEducation.schoolCollegeName) && inputChanged} message="Name cannot be empty" />
                </div>
                <div styleName="field col-3">
                  <label htmlFor="major">
                    Major
                    <input type="hidden" />
                  </label>
                  <input id="major" name="major" type="text" placeholder="Major" onChange={this.onUpdateInput} value={newEducation.major} maxLength="64" required />
                </div>
              </div>
              <div styleName="row">
                <div styleName="field col-date">
                  <label htmlFor="timePeriodFrom">
                    Start Date
                    <input type="hidden" />
                  </label>
                  <DatePicker
                    readOnly
                    numberOfMonths={1}
                    isOutsideRange={moment()}
                    date={newEducation.timePeriodFrom}
                    id="date-from2"
                    onDateChange={date => this.onUpdateDate(date, 'timePeriodFrom')}
                    placeholder="dd/mm/yyyy"
                  />
                  <ErrorMessage
                    invalid={this.onCheckStartDate(newEducation).invalid && inputChanged}
                    message={this.onCheckStartDate(newEducation).message}
                  />
                </div>
                <div styleName="field col-date">
                  <label htmlFor="timePeriodTo">
                    End Date (or expected)
                    <input type="hidden" />
                  </label>
                  {
                    newEducation.graduated ? (
                      <DatePicker
                        readOnly
                        numberOfMonths={1}
                        isOutsideRange={moment()}
                        date={newEducation.timePeriodTo}
                        id="date-to2"
                        onDateChange={date => this.onUpdateDate(date, 'timePeriodTo')}
                        placeholder="dd/mm/yyyy"
                      />
                    ) : (
                      <DatePicker
                        readOnly
                        numberOfMonths={1}
                        date={newEducation.timePeriodTo}
                        id="date-to2"
                        onDateChange={date => this.onUpdateDate(date, 'timePeriodTo')}
                        placeholder="dd/mm/yyyy"
                        allowFutureYear
                      />
                    )
                  }
                  <ErrorMessage
                    invalid={this.onCheckEndDate(newEducation).invalid && inputChanged}
                    message={this.onCheckEndDate(newEducation).message}
                  />
                </div>
                <div styleName="field col-checkbox">
                  <div styleName="tc-checkbox">
                    <input
                      name="graduated"
                      checked={newEducation.graduated}
                      id="graduated"
                      onChange={this.onUpdateInput}
                      type="checkbox"
                    />
                    <label htmlFor="graduated">
                      <div styleName="tc-checkbox-label">
                        Graduated
                      </div>
                      <input type="hidden" />
                    </label>
                  </div>
                </div>
              </div>
            </form>
            <div styleName="button-container">
              <div styleName="button-save">
                <PrimaryButton
                  styleName="complete"
                  onClick={this.onHandleAddEducation}
                >
                  {
                    isEdit ? (<React.Fragment>Edit Education</React.Fragment>)
                      : (<React.Fragment>Add Education</React.Fragment>)
                  }
                </PrimaryButton>
              </div>
              {
                isEdit && (
                  <div styleName="button-cancel">
                    <PrimaryButton
                      styleName="complete"
                      onClick={this.onCancelEditStatus}
                    >
                      Cancel
                    </PrimaryButton>
                  </div>
                )
              }
            </div>
          </div>
          {
            isMobileView && educationItems.length > 0
            && (
              <EducationList
                educationList={{ items: educationItems }}
                onDeleteItem={this.onHandleDeleteEducation}
                onEditItem={this.onEditEducation}
              />
            )
          }
        </div>
      </div>
    );
  }
}

Education.propTypes = {
  tokenV3: PT.string.isRequired,
  handle: PT.string.isRequired,
  userTraits: PT.array.isRequired,
  addUserTrait: PT.func.isRequired,
  updateUserTrait: PT.func.isRequired,
  deleteUserTrait: PT.func.isRequired,
  settingsUI: PT.shape().isRequired,
};
