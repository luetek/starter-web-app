import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import { NavLink, useLocation, useNavigate, createSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUser } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

export function AppHeader() {
  const path = useLocation();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState<string>('');
  const userAccessToken = useSelector((state: RootState) => state.user);
  const isLoggedIn = !!userAccessToken.token;
  return (
    <Navbar bg="primary" expand="md" className="app-header" fixed="top">
      <Container>
        <Navbar.Brand href="#home">Luetek Academy</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/home" className={path.pathname.match('/home') ? 'active' : ''}>
              Home
            </Nav.Link>
            <Nav.Link as={NavLink} to="/content" className={path.pathname.match('/content') ? 'active' : ''}>
              Content
            </Nav.Link>
            <Nav.Link as={NavLink} to="/contact" className={path.pathname.match('/contact') ? 'active' : ''}>
              Contact
            </Nav.Link>
          </Nav>
          <Form className="d-flex visually-hidden">
            <InputGroup className="me-3">
              <Form.Control
                type="search"
                placeholder="Search"
                size="sm"
                aria-label="Search"
                onChange={(event) => {
                  event.preventDefault();
                  setSearchText(event.target.value);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    navigate({
                      pathname: '/search',
                      search: createSearchParams({ str: searchText }).toString(),
                    });
                  }
                }}
              />

              <Button
                onClick={(event) => {
                  event.preventDefault();
                  navigate({
                    pathname: '/search',
                    search: createSearchParams({ str: searchText }).toString(),
                  });
                }}
                variant="light"
              >
                <FontAwesomeIcon icon={faSearch} />
              </Button>
            </InputGroup>
          </Form>
          <Dropdown>
            <Dropdown.Toggle id="dropdown-basic" style={{ backgroundColor: 'transparent', border: 'none' }}>
              <FontAwesomeIcon icon={faUser} />
            </Dropdown.Toggle>
            {isLoggedIn ? (
              <Dropdown.Menu>
                <Dropdown.Item as={NavLink} to="/profile">
                  Profile
                </Dropdown.Item>
                <Dropdown.Item as={NavLink} to="/logout">
                  Sign out
                </Dropdown.Item>
              </Dropdown.Menu>
            ) : (
              <Dropdown.Menu>
                <Dropdown.Item as={NavLink} to="/login">
                  Login
                </Dropdown.Item>
                <Dropdown.Item as={NavLink} to="/signup">
                  SignUp
                </Dropdown.Item>
              </Dropdown.Menu>
            )}
          </Dropdown>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
