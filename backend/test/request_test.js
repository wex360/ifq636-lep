// LEP-15: partner request rules, tested with stubs in the style of example_test.js (no database).
const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const User = require('../models/User');
const PartnerRequest = require('../models/PartnerRequest');
const { createRequest, respondRequest } = require('../controllers/requestController');

const mockRes = () => ({ status: sinon.stub().returnsThis(), json: sinon.spy() });
const id = () => new mongoose.Types.ObjectId();

describe('createRequest', () => {
  afterEach(() => sinon.restore());

  it('returns 400 when a learner sends a request to themselves', async () => {
    const me = id();
    const create = sinon.stub(PartnerRequest, 'create');
    const res = mockRes();
    await createRequest({ user: { id: me }, body: { to: me.toString() } }, res);
    expect(res.status.calledWith(400)).to.be.true;
    expect(create.called).to.be.false;
  });

  it('returns 201 and the new pending request for a valid partner', async () => {
    const me = id();
    const partner = id();
    sinon.stub(User, 'findById').resolves({ _id: partner, hidden: false });
    sinon.stub(PartnerRequest, 'findOne').resolves(null);
    const created = { _id: id(), from: me, to: partner, message: 'Hola', status: 'pending' };
    const create = sinon.stub(PartnerRequest, 'create').resolves(created);
    const res = mockRes();
    await createRequest({ user: { id: me }, body: { to: partner, message: 'Hola' } }, res);
    expect(create.calledOnceWith({ from: me, to: partner, message: 'Hola' })).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(created)).to.be.true;
  });

  it('returns 409 when a pending request already exists between the pair', async () => {
    sinon.stub(User, 'findById').resolves({ hidden: false });
    sinon.stub(PartnerRequest, 'findOne').resolves({ status: 'pending' });
    const res = mockRes();
    await createRequest({ user: { id: id() }, body: { to: id() } }, res);
    expect(res.status.calledWith(409)).to.be.true;
  });

  it('returns 404 for a profile a moderator has hidden', async () => {
    sinon.stub(User, 'findById').resolves({ hidden: true });
    const res = mockRes();
    await createRequest({ user: { id: id() }, body: { to: id() } }, res);
    expect(res.status.calledWith(404)).to.be.true;
  });
});

describe('respondRequest', () => {
  afterEach(() => sinon.restore());

  const pending = (from, to) => ({ from, to, status: 'pending', save: sinon.stub().resolvesThis() });

  it('lets the recipient accept a pending request', async () => {
    const from = id(); const to = id();
    const request = pending(from, to);
    sinon.stub(PartnerRequest, 'findById').resolves(request);
    const res = mockRes();
    await respondRequest({ user: { id: to }, params: { id: id() }, body: { action: 'accept' } }, res);
    expect(request.status).to.equal('accepted');
    expect(res.json.calledOnce).to.be.true;
  });

  it('returns 403 when the sender tries to accept their own request', async () => {
    const from = id(); const to = id();
    sinon.stub(PartnerRequest, 'findById').resolves(pending(from, to));
    const res = mockRes();
    await respondRequest({ user: { id: from }, params: { id: id() }, body: { action: 'accept' } }, res);
    expect(res.status.calledWith(403)).to.be.true;
  });

  it('returns 409 when the request is no longer pending', async () => {
    const from = id(); const to = id();
    sinon.stub(PartnerRequest, 'findById').resolves({ from, to, status: 'declined' });
    const res = mockRes();
    await respondRequest({ user: { id: from }, params: { id: id() }, body: { action: 'cancel' } }, res);
    expect(res.status.calledWith(409)).to.be.true;
  });
});

describe('bookSession', () => {
  const Session = require('../models/Session');
  const { bookSession } = require('../controllers/sessionController');
  afterEach(() => sinon.restore());

  it('returns 409 when the partner request is still pending', async () => {
    const me = id();
    sinon.stub(PartnerRequest, 'findById').resolves({ from: me, to: id(), status: 'pending' });
    const create = sinon.stub(Session, 'create');
    const res = mockRes();
    await bookSession({ user: { id: me }, body: { requestId: id(), startsAt: '2030-01-01T10:00:00Z', durationMins: 30 } }, res);
    expect(res.status.calledWith(409)).to.be.true;
    expect(create.called).to.be.false;
  });

  it('returns 201 for a participant on an accepted request', async () => {
    const me = id(); const partner = id();
    sinon.stub(PartnerRequest, 'findById').resolves({ _id: id(), from: me, to: partner, status: 'accepted' });
    sinon.stub(Session, 'create').resolves({ status: 'booked' });
    const res = mockRes();
    await bookSession({ user: { id: me }, body: { requestId: id(), startsAt: '2030-01-01T10:00:00Z', durationMins: 30 } }, res);
    expect(res.status.calledWith(201)).to.be.true;
  });
});

describe('moderation setHidden', () => {
  const { setHidden } = require('../controllers/moderationController');
  afterEach(() => sinon.restore());

  it('hides a learner profile', async () => {
    const user = { _id: id(), name: 'Ana', role: 'learner', hidden: false, save: sinon.stub().resolvesThis() };
    sinon.stub(User, 'findById').resolves(user);
    const res = mockRes();
    await setHidden({ params: { id: id() }, body: { hidden: true } }, res);
    expect(user.hidden).to.equal(true);
    expect(res.json.calledOnce).to.be.true;
  });
});
