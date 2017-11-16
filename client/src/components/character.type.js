import PropTypes from 'prop-types'

export default {
  name: PropTypes.string.isRequired,
  classId: PropTypes.number.isRequired,
  role: PropTypes.number.isRequired,
  armorType: PropTypes.number.isRequired,
  armorToken: PropTypes.number.isRequired,
  ilvl: PropTypes.number.isRequired,
  main: PropTypes.bool.isRequired,
}
