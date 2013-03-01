<?php

namespace Zeega\AdminBundle\AdminEntity;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Validator\ErrorElement;
use Sonata\AdminBundle\Form\FormMapper;

class UserAdmin extends Admin
{
    protected function configureFormFields(FormMapper $formMapper)
    {
		$roles = array('ROLE_USER' => 'User','ROLE_ADMIN'=>'Admin');
        $formMapper
            ->add('username')
			->add('display_name')
			->add('email')
			->add('roles', 'choice', array('choices' => $roles,'multiple' => true))
        ;
    }

    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('username')

        ;
    }

	public function preUpdate($user)
    {
        //$this->getUserManager()->updateCanonicalFields($user);
        //$this->getUserManager()->updatePassword($user);
    }

    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->addIdentifier('username')
			->add('display_name')
			->add('email')
        ;
    }

    public function validate(ErrorElement $errorElement, $object)
    {
        $errorElement
            ->with('username')
                ->assertMaxLength(array('limit' => 32))
            ->end()
        ;
    }

    public function getTemplate($name)
    {
        switch ($name) {
            case 'edit':
                return 'ZeegaAdminBundle::edit_custom.html.twig';
                break;
            default:
                return parent::getTemplate($name);
                break;
        }
    }
}