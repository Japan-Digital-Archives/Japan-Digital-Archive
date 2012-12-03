<?php

namespace Zeega\UserBundle\Form\Type;

use Symfony\Component\Form\FormBuilderInterface;
use FOS\UserBundle\Form\Type\RegistrationFormType as BaseType;

class RegistrationFormType extends BaseType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
            // add your custom field
        $builder->add('display_name');

        parent::buildForm($builder, $options);
		
    }

    public function getName()
    {
        return 'zeega_user_registration';
    }
}
