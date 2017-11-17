import React from 'react'
import PropTypes from 'prop-types'

import { Form, Text, Select } from 'react-form'

const PlanForm = ({ title = '', onSubmit, guilds = [] }) => {
  return (
    <Form onSubmit={onSubmit}>
      {formApi => (
        <form onSubmit={formApi.submitForm}>
          <h2>{title}</h2>
          <label htmlFor="title">Title</label>
          <Text field="title" />
          <label htmlFor="date">Date</label>
          <Text field="date" type="date" />
          <label htmlFor="guild">Guild</label>
          <Select field="guild" options={guilds} />
          <button type="submit">Submit</button>
        </form>
      )}
    </Form>
  )
}

PlanForm.propTypes = {
  title: PropTypes.string,
}

export default PlanForm
