// LEP-16 and LEP-7: the middleware chain links, tested without a database.
const { expect } = require('chai');
const sinon = require('sinon');
const { validate, required, isEmail, minLength, languageList } = require('../middleware/validate');
const { requireRole } = require('../middleware/roleMiddleware');

const mockRes = () => ({ status: sinon.stub().returnsThis(), json: sinon.spy() });

describe('validate middleware', () => {
  const rules = validate({
    email: [required('Email'), isEmail],
    password: [required('Password'), minLength(8, 'Password')],
    nativeLanguages: [languageList('Native languages')],
  });

  it('calls next on a valid body', () => {
    const next = sinon.spy();
    rules({ body: { email: 'a@b.co', password: 'longenough', nativeLanguages: ['English'] } }, mockRes(), next);
    expect(next.calledOnce).to.be.true;
  });

  it('returns 400 with one message per bad field and skips the controller', () => {
    const next = sinon.spy();
    const res = mockRes();
    rules({ body: { email: 'not-an-email', password: 'short', nativeLanguages: 'English' } }, res, next);
    expect(next.called).to.be.false;
    expect(res.status.calledWith(400)).to.be.true;
    const { errors } = res.json.firstCall.args[0];
    expect(Object.keys(errors)).to.have.members(['email', 'password', 'nativeLanguages']);
  });
});

describe('requireRole middleware', () => {
  it('lets a moderator through', () => {
    const next = sinon.spy();
    requireRole('moderator')({ user: { role: 'moderator' } }, mockRes(), next);
    expect(next.calledOnce).to.be.true;
  });

  it('returns 403 for a learner', () => {
    const next = sinon.spy();
    const res = mockRes();
    requireRole('moderator')({ user: { role: 'learner' } }, res, next);
    expect(next.called).to.be.false;
    expect(res.status.calledWith(403)).to.be.true;
  });
});
